import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('drink_types')
export class DrinkType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    imageUrl: string;

    @Column()
    caffeineMg: number;

    @Column()
    sugarG: number;

    @Column()
    calories: number;

    @Column()
    acidity: number;

    @Column()
    bitterness: number;

    @Column()
    body: number;

    @Column()
    note: string;
}
