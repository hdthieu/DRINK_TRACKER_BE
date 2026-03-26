import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('food_inventories')
export class FoodInventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    itemName: string;

    @Column({ type: 'float', default: 0 })
    quantityInBaseUnit: number;

    @Column()
    baseUnitSymbol: string; // "g", "ml", "piece"

    @Column({ nullable: true })
    displayUnitSymbol: string; // "kg", "l", "box"

    @Column({ type: 'float', nullable: true })
    lowStockThreshold: number;

    @ManyToOne(() => User, (user) => user.inventories)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
