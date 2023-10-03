package main

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func (h *handler) getMessages(c echo.Context) error {
	selfID, ok := c.Get(USER_ID_KEY).(int)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	otherID, err := strconv.Atoi(c.QueryParam("user-id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	messages := make([]Message, 0)
	sql := `
SELECT
	sender_id,
	receiver_id,
	content,
	created_at,
	read_at
FROM
	messages
WHERE
	sender_id = $1 AND receiver_id = $2
	OR sender_id = $2 AND receiver_id = $1
ORDER BY
	created_at
`
	h.lock.Lock()
	rows, _ := h.db.Query(c.Request().Context(), sql, selfID, otherID)
	h.lock.Unlock()
	for rows.Next() {
		var m Message
		if err := rows.Scan(&m.SenderID, &m.ReceiverID, &m.Content, &m.CreatedAt, &m.ReadAt); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError)
		}
		messages = append(messages, m)
	}
	if err := rows.Err(); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"data": messages,
	})
}

func (h *handler) getUserInfos(c echo.Context) error {
	selfID, ok := c.Get(USER_ID_KEY).(int)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	userInfos := make([]UserInfo, 0)
	sql := `
WITH ranked_messages AS (
SELECT
	sender_id,
	receiver_id,
	content,
	created_at,
	read_at,
	ROW_NUMBER() OVER (
		PARTITION BY CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
		ORDER BY created_at DESC
	) rnk
FROM
	messages
WHERE
	sender_id = $1
	OR receiver_id = $1
),
unread_messages AS (
SELECT
	CASE
		WHEN sender_id = $1 THEN receiver_id
		ELSE sender_id
	END id,
	COUNT(*) unread_count
FROM
	ranked_messages
WHERE
	read_at IS NULL
	AND receiver_id = $1
GROUP BY
	id
)
SELECT
	u.id,
	u.username,
	rm.content,
	rm.created_at,
	um.unread_count
FROM
	users u
LEFT JOIN ranked_messages rm ON
	(u.id = rm.sender_id OR u.id = rm.receiver_id)
	AND rm.rnk = 1
LEFT JOIN unread_messages um ON
	u.id = um.id
WHERE
	u.id != $1
ORDER BY
	rm.created_at DESC
`
	h.lock.Lock()
	rows, _ := h.db.Query(c.Request().Context(), sql, selfID)
	h.lock.Unlock()
	for rows.Next() {
		var u UserInfo
		if err := rows.Scan(&u.ID, &u.Username, &u.Content, &u.CreatedAt, &u.UnreadCount); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError)
		}
		userInfos = append(userInfos, u)
	}
	if err := rows.Err(); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"data": userInfos,
	})
}
