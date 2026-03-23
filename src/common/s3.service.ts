import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor(private configService: ConfigService) {
        this.region = this.configService.getOrThrow<string>('S3_REGION');
        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
                secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
            },
        });
        this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'avatars') {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        try {
            await this.s3Client.send(command);
            return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new Error('Không thể tải ảnh lên mây! 🏹');
        }
    }
}
