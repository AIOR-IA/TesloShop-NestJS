import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn()
    id:number;

    @Column('text')
    url:string

    // muchas imagenes pueden tener 1 producto
    @ManyToOne(
        () => Product,
        (product) => product.images
    )
    product: Product
}