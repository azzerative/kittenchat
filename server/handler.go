package main

import "github.com/jackc/pgx/v5/pgxpool"

type handler struct {
	db *pgxpool.Pool
}
