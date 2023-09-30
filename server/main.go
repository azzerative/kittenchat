package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo/v4"
)

var db *pgxpool.Pool

func main() {
	var err error

	e := echo.New()

	db, err = pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		e.Logger.Fatal(err)
	}
	defer db.Close()

	e.GET("/", func(c echo.Context) error {
		var date time.Time
		if err := db.QueryRow(c.Request().Context(), "SELECT now()").Scan(&date); err != nil {
			return err
		}

		return c.String(http.StatusOK, date.String())
	})

	e.Logger.Fatal(e.Start(os.Getenv("ADDRESS")))
}
