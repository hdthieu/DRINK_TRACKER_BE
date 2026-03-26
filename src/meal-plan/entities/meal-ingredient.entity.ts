import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MealPlan } from './meal-plan.entity';
import { FoodInventory } from 'src/food-inventory/entities/food-inventory.entity';

@Entity('meal_ingredients')
export class MealIngredient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => MealPlan, (mealPlan) => mealPlan.ingredients)
    mealPlan: MealPlan;

    @ManyToOne(() => FoodInventory)
    inventoryItem: FoodInventory;

    @Column({ type: 'float' })
    amountInBaseUnit: number;

    @Column()
    unitSymbol: string; // "g", "ml", "piece"
}
