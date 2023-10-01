package main

import (
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
)

type handler struct {
	db         *pgxpool.Pool
	wsUpgrader websocket.Upgrader
	chatConns  map[int]*websocket.Conn
}
