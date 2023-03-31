import {CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}