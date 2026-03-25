import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('drink_types')
export class DrinkType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ type: 'int', default: 0 })
    caffeineMg: number;

    @Column({ type: 'int', default: 0 })
    sugarG: number;

    @Column({ type: 'int', default: 0 })
    calories: number;

    @Column({ type: 'int', default: 0 })
    acidity: number;

    @Column({ type: 'int', default: 0 })
    bitterness: number;

    @Column({ type: 'int', default: 0 })
    body: number;

}
