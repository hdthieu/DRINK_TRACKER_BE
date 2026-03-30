import { Drinklog } from "src/drinklog/entities/drinklog.entity";
import { HomeRecipe } from "src/home-receipt/entities/home-receipt.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRoadmap } from "src/roadmap/entities/roadmap.entity";
import { FoodInventory } from "src/food-inventory/entities/food-inventory.entity";
import { MealPlan } from "src/meal-plan/entities/meal-plan.entity";

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

    @Column({ nullable: true })
    imageUrl: string;

    // @Column({ type: 'int', nullable: true })
    // age: number;

    // @Column({ type: 'int', default: 0 })
    // exerciseTimeMinutes: number;

    // @Column({ default: false })
    // isHighTemperature: boolean;

    @OneToMany(() => HomeRecipe, (recipe) => recipe.user)
    homeRecipes: HomeRecipe[];

    @OneToMany(() => UserRoadmap, (roadmap) => roadmap.user)
    roadmaps: UserRoadmap[];

    @OneToMany(() => FoodInventory, (inventory) => inventory.user)
    inventories: FoodInventory[];

    @OneToMany(() => MealPlan, (mealPlan) => mealPlan.user)
    mealPlans: MealPlan[];
}

