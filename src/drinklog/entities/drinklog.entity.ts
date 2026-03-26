import { DrinkType } from "src/drink-type/entities/drink-type.entity";
import { HomeRecipe } from "src/home-receipt/entities/home-receipt.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DrinkSize, DrinkTemperature } from "src/common/enums";

@Entity('drink_logs')
export class Drinklog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    drinkName: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: false })
    isHomeMade: boolean;

    @OneToOne(() => HomeRecipe)
    @JoinColumn()
    homeRecipe: HomeRecipe;

    // --- Chỉ số Sức khỏe ---
    @Column({ type: 'int' })
    caffeineMg: number;

    @Column({ type: 'int' })
    sugarG: number;

    @Column({ type: 'int', default: 250 })
    volumeMl: number;

    @Column({ type: 'int' })
    calories: number;

    // --- Tài chính ---
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    // --- Rating & Flavor (Chỉ số hương vị) ---
    @Column({ type: 'int', default: 5 })
    rating: number;

    @Column({ type: 'int', default: 0 })
    acidity: number;

    @Column({ type: 'int', default: 0 })
    bitterness: number;

    @Column({ type: 'int', default: 0 })
    body: number;

    @Column({ type: 'enum', enum: DrinkSize, default: DrinkSize.MEDIUM })
    size: DrinkSize;

    @Column({ type: 'enum', enum: DrinkTemperature, default: DrinkTemperature.HOT })
    temperature: DrinkTemperature;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.logs)
    user: User;

    @OneToOne(() => DrinkType)
    @JoinColumn()
    drinkType: DrinkType;
}

