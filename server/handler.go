package main

import (
	"sync"

	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
)

type handler struct {
	lock       sync.Mutex
	db         *pgxpool.Pool
	wsUpgrader websocket.Upgrader
	chatConns  map[int]*websocket.Conn
}
