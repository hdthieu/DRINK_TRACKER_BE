import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('inventory_units')
export class InventoryUnit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    symbol: string; // "g", "ml", "box"

    @Column()
    label: string; // "Gam (g)", "Mililit (ml)"

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
