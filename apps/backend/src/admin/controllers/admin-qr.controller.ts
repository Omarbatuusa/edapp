import { Controller, Get, Param, Res, UseGuards, NotFoundException, ForbiddenException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Response } from 'express';
import * as QRCode from 'qrcode';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { Tenant } from '../../tenants/tenant.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'app_super_admin', 'platform_secretary', 'app_secretary', 'platform_support', 'app_support', 'brand_admin'];

@Controller('admin/tenants/:id/qr')
@UseGuards(FirebaseAuthGuard)
export class AdminQrController {
    constructor(
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private checkAccess(req: any) {
        const role = this.getRole(req);
        if (!PLATFORM_ROLES.some(r => role.includes(r))) {
            throw new ForbiddenException('Only platform admins can access QR codes');
        }
    }

    /**
     * GET /admin/tenants/:id/qr/code — returns QR code as data URL JSON
     */
    @Get('code')
    async getQrCode(@Req() req: any, @Param('id') id: string) {
        this.checkAccess(req);
        const tenant = await this.tenantRepo.findOne({ where: { id } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        const url = `https://app.edapp.co.za/scan/${tenant.school_code}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });

        return {
            qr_data_url: dataUrl,
            scan_url: url,
            school_code: tenant.school_code,
            school_name: tenant.school_name,
            tenant_slug: tenant.tenant_slug,
        };
    }

    /**
     * GET /admin/tenants/:id/qr/pdf — returns printable A4 PDF with QR code
     */
    @Get('pdf')
    async getQrPdf(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
        this.checkAccess(req);
        const tenant = await this.tenantRepo.findOne({ where: { id } });
        if (!tenant) throw new NotFoundException('Tenant not found');

        const url = `https://app.edapp.co.za/scan/${tenant.school_code}`;
        const qrBuffer = await QRCode.toBuffer(url, { width: 300, margin: 2 });

        // Use pdfkit to generate A4 PDF
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${tenant.school_code}-qr.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(28).font('Helvetica-Bold').text(tenant.school_name, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica').fillColor('#666666').text(`School Code: ${tenant.school_code}`, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(12).text(`${tenant.tenant_slug}.edapp.co.za`, { align: 'center' });
        doc.moveDown(2);

        // QR Code — centered
        const qrSize = 250;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const qrX = doc.page.margins.left + (pageWidth - qrSize) / 2;
        doc.image(qrBuffer, qrX, doc.y, { width: qrSize, height: qrSize });
        doc.moveDown(1);
        doc.y += qrSize + 20;

        // Instructions
        doc.fontSize(13).font('Helvetica').fillColor('#333333').text(
            'Scan this QR code to visit ' + tenant.school_name + ' on EdApp',
            { align: 'center' },
        );
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#888888').text(
            'Parents and staff can scan this code with their phone camera to access the school portal.',
            { align: 'center' },
        );

        // Footer
        doc.moveDown(4);
        doc.fontSize(9).fillColor('#aaaaaa').text(
            `Generated on ${new Date().toLocaleDateString('en-ZA')} | edapp.co.za`,
            { align: 'center' },
        );

        doc.end();
    }
}
