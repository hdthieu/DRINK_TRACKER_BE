import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity('home_recipes')
export class HomeRecipe {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // --- Công thức & Template ---
    @Column({ type: 'jsonb', nullable: true })
    ingredients: { item: string, amount: string }[];

    @Column({ type: 'text', array: true, nullable: true })
    instructions: string[];

    // --- Chỉ số mẫu ---
    @Column({ type: 'int', default: 0 })
    defaultCaffeine: number;

    @Column({ type: 'int', default: 0 })
    defaultCalories: number;

    @Column({ type: 'int', default: 0 })
    defaultSugar: number;

    // --- Đánh giá để nhớ món này ngon hay không ---
    @Column({ type: 'int', default: 5 })
    lastRating: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.homeRecipes)
    user: User;
}