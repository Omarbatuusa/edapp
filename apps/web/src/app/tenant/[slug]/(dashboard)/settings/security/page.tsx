'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Policy {
    geoMode: string;
    ipMode: string;
    geoAccuracyThresholdM: number;
    geoMaxAgeSeconds: number;
}

interface IpEntry {
    id: string;
    cidr: string;
    label: string;
    enabled: boolean;
}

export default function SecuritySettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [ips, setIps] = useState<IpEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'geo' | 'ip'>('geo');
    const [newIp, setNewIp] = useState({ cidr: '', label: '' });

    // API Base URL - assuming relative path proxy or env var
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock headers for tenant context - in real app this comes from session/auth middleware
            const headers = {
                'Content-Type': 'application/json',
                'x-tenant-id': slug // Using slug as tenantId for demo simplicity
            };

            const [policyRes, ipRes] = await Promise.all([
                fetch(`${API_URL}/security-settings/policy`, { headers }),
                fetch(`${API_URL}/security-settings/ip-allowlist`, { headers })
            ]);

            if (policyRes.ok) setPolicy(await policyRes.json());
            if (ipRes.ok) setIps(await ipRes.json());

        } catch (e) {
            console.error('Failed to fetch settings', e);
        } finally {
            setLoading(false);
        }
    };

    const savePolicy = async () => {
        if (!policy) return;
        try {
            const headers = {
                'Content-Type': 'application/json',
                'x-tenant-id': slug
            };
            await fetch(`${API_URL}/security-settings/policy`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(policy)
            });
            alert('Policy saved successfully');
        } catch (e) {
            alert('Failed to save policy');
        }
    };

    const addIp = async () => {
        if (!newIp.cidr) return;
        try {
            const headers = {
                'Content-Type': 'application/json',
                'x-tenant-id': slug
            };
            const res = await fetch(`${API_URL}/security-settings/ip-allowlist`, {
                method: 'POST',
                headers,
                body: JSON.stringify(newIp)
            });
            if (res.ok) {
                setIps([...ips, await res.json()]);
                setNewIp({ cidr: '', label: '' });
            }
        } catch (e) {
            alert('Failed to add IP');
        }
    };

    const toggleIp = async (id: string, enabled: boolean) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'x-tenant-id': slug
            };
            await fetch(`${API_URL}/security-settings/ip-allowlist/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ enabled })
            });
            setIps(ips.map(ip => ip.id === id ? { ...ip, enabled } : ip));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8">Loading security settings...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Attendance & Access Security</h1>

            <div className="flex space-x-4 mb-6 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'geo' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('geo')}
                >
                    Geo-Fencing
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'ip' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('ip')}
                >
                    IP Allowlist
                </button>
            </div>

            {activeTab === 'geo' && policy && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-lg font-semibold mb-4">Geo-Fence Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Enforcement Mode</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={policy.geoMode}
                                    onChange={(e) => setPolicy({ ...policy, geoMode: e.target.value })}
                                >
                                    <option value="OFF">Off</option>
                                    <option value="WARN">Warn (Log only)</option>
                                    <option value="ENFORCE">Enforce (Block)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Accuracy Threshold (meters)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={policy.geoAccuracyThresholdM}
                                    onChange={(e) => setPolicy({ ...policy, geoAccuracyThresholdM: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-medium mb-2">Branch Zones</h3>
                            <p className="text-sm text-gray-500 mb-4">Define permitted zones for each branch.</p>
                            {/* Map Component Placeholder */}
                            <div className="bg-gray-100 h-64 rounded flex items-center justify-center border-2 border-dashed">
                                <span className="text-gray-500">Map Component Placeholder (Google Maps / Leaflet)</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={savePolicy}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ip' && policy && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-lg font-semibold mb-4">IP Address Allowlist</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Enforcement Mode</label>
                            <select
                                className="w-full border rounded p-2"
                                value={policy.ipMode}
                                onChange={(e) => setPolicy({ ...policy, ipMode: e.target.value })}
                            >
                                <option value="OFF">Off</option>
                                <option value="WARN">Warn (Log only)</option>
                                <option value="ENFORCE">Enforce (Block)</option>
                            </select>
                            <button
                                onClick={savePolicy}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                                Save Mode
                            </button>
                        </div>

                        <div className="border rounded overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIDR / IP</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Enabled</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ips.length === 0 && (
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={3}>No IPs configured.</td>
                                        </tr>
                                    )}
                                    {ips.map(ip => (
                                        <tr key={ip.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.cidr}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ip.label}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={ip.enabled}
                                                    onChange={(e) => toggleIp(ip.id, e.target.checked)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gray-50 p-4 rounded border">
                            <h3 className="text-sm font-medium mb-2">Add New IP</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="CIDR (e.g. 192.168.1.1/32)"
                                    className="border rounded p-2 flex-1"
                                    value={newIp.cidr}
                                    onChange={e => setNewIp({ ...newIp, cidr: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Label (e.g. Office)"
                                    className="border rounded p-2 flex-1"
                                    value={newIp.label}
                                    onChange={e => setNewIp({ ...newIp, label: e.target.value })}
                                />
                                <button
                                    onClick={addIp}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
