import { Drinklog } from "src/drinklog/entities/drinklog.entity";
import { HomeRecipe } from "src/home-receipt/entities/home-receipt.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ type: 'float', nullable: true })
    weight: number;

    @Column({ default: 400 })
    dailyCaffeineLimit: number;

    @Column({ default: 30 })
    dailySugarLimit: number;

    @OneToMany(() => Drinklog, (log) => log.user)
    logs: Drinklog[];

    @Column()
    imageUrl: string;

    @OneToMany(() => HomeRecipe, (recipe) => recipe.user)
    homeRecipes: HomeRecipe[];
}

