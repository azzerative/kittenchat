package main

import (
	"net/http"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

func protectedRoute(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sess, err := session.Get(SESSION_NAME, c)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError)
		}

		if sess.IsNew {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		c.Set(USER_ID_KEY, sess.Values[USER_ID_KEY])
		return next(c)
	}
}
