package main

import (
	"errors"
	"net/http"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func (h *handler) register(c echo.Context) error {
	var (
		input struct {
			Username string `json:"username" validate:"required"`
			Password string `json:"password" validate:"required"`
		}
		userID int
	)

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}
	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	if err = h.db.QueryRow(c.Request().Context(), "INSERT INTO users (username, hashed_password) VALUES ($1, $2) RETURNING id", input.Username, hashedPassword).Scan(&userID); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgerrcode.IsIntegrityConstraintViolation(pgErr.Code) {
				return echo.NewHTTPError(http.StatusBadRequest)
			}
		}
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	sess, err := session.Get(SESSION_NAME, c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}
	sess.Values[USER_ID_KEY] = userID
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"message": "Register successful",
	})
}

func (h *handler) login(c echo.Context) error {
	var (
		input struct {
			Username string `json:"username" validate:"required"`
			Password string `json:"password" validate:"required"`
		}
		userID         int
		hashedPassword []byte
	)

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}
	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	if err := h.db.QueryRow(c.Request().Context(), "SELECT id, hashed_password FROM users WHERE username = $1", input.Username).Scan(&userID, &hashedPassword); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	if err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(input.Password)); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	sess, err := session.Get(SESSION_NAME, c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}
	sess.Values[USER_ID_KEY] = userID
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Login successful",
	})
}

func (h *handler) getProfile(c echo.Context) error {
	var (
		user User
		ok   bool
	)

	user.ID, ok = c.Get(USER_ID_KEY).(int)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	if err := h.db.QueryRow(c.Request().Context(), "SELECT username, created_at FROM users WHERE id = $1", user.ID).Scan(&user.Username, &user.CreatedAt); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"data": user,
	})
}

func (h *handler) logout(c echo.Context) error {
	sess, err := session.Get(SESSION_NAME, c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	sess.Options.MaxAge = -1
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Logout successful",
	})
}
