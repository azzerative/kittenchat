package main

import (
	"encoding/json"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

func (h *handler) chat(c echo.Context) error {
	senderConn, err := h.wsUpgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer senderConn.Close()

	h.chatConns[c.Get(USER_ID_KEY).(int)] = senderConn

	for {
		var msg Message

		_, p, err := senderConn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				c.Logger().Error(err)
			}
			break
		}

		if err := json.Unmarshal(p, &msg); err != nil {
			c.Logger().Error(err)
			continue
		}
		if err := c.Validate(msg); err != nil {
			c.Logger().Error(err)
			continue
		}

		if _, err := h.db.Exec(c.Request().Context(), "INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES ($1, $2, $3, $4)", msg.SenderID, msg.ReceiverID, msg.Content, msg.CreatedAt); err != nil {
			c.Logger().Error(err)
			continue
		}
		receiverConn, ok := h.chatConns[msg.ReceiverID]
		if !ok {
			continue
		}
		if err := receiverConn.WriteMessage(websocket.TextMessage, p); err != nil {
			c.Logger().Error(err)
			continue
		}
	}
	return nil
}
