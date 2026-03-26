import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MealType, DayOfWeek } from 'src/common/enums';
import { MealIngredient } from './meal-ingredient.entity';

@Entity('meal_plans')
export class MealPlan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    dayOfWeek: DayOfWeek;

    @Column({
        type: 'enum',
        enum: MealType,
        default: MealType.BREAKFAST,
    })
    mealType: MealType;

    @Column()
    mealName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => MealIngredient, (ingredient) => ingredient.mealPlan)
    ingredients: MealIngredient[];

    @ManyToOne(() => User, (user) => user.mealPlans)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
