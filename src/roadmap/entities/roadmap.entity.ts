import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ActivityType, MealType } from 'src/common/enums';
import { MealPlan } from 'src/meal-plan/entities/meal-plan.entity';

@Entity('user_roadmaps')
export class UserRoadmap {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    time: string; // "HH:mm"

    @Column()
    activityName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ActivityType,
        default: ActivityType.GENERAL,
    })
    activityType: ActivityType;

    @ManyToOne(() => MealPlan, { nullable: true })
    mealPlan: MealPlan;
    
    @Column({ default: false })
    isCompleted: boolean;

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @ManyToOne(() => User, (user) => user.roadmaps)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
