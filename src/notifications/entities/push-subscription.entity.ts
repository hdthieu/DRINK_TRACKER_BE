import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('push_subscriptions')
export class PushSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('jsonb')
    subscription: any;

    @Column({ nullable: true })
    userAgent: string;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
