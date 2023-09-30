package main

import (
	"context"
	"net/http"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type CustomValidator struct {
	validator *validator.Validate
}

const (
	SESSION_NAME = "session"
	USER_ID_KEY  = "user_id"
)

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

func main() {
	e := echo.New()
	e.Validator = &CustomValidator{validator: validator.New()}

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${time_rfc3339} ${method} ${uri} ${status} ${error}\n",
	}))
	e.Use(session.Middleware(sessions.NewCookieStore([]byte(os.Getenv("COOKIE_AUTH_KEY")))))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOriginFunc: func(origin string) (bool, error) {
			return origin == os.Getenv("CLIENT_ORIGIN"), nil
		},
		AllowMethods:     []string{http.MethodGet, http.MethodPost},
		AllowCredentials: true,
	}))

	db, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		e.Logger.Fatal(err)
	}
	defer db.Close()

	handler := &handler{
		db: db,
	}

	api := e.Group("/api")
	api.POST("/register", handler.register)
	api.POST("/login", handler.login)
	api.GET("/profile", handler.getProfile, protectedRoute)
	api.POST("/logout", handler.logout)

	e.Logger.Fatal(e.Start(os.Getenv("ADDRESS")))
}
