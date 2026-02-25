import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3333;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 EdApp API running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start EdApp API:', err);
  process.exit(1);
});
