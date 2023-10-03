package main

import (
	"context"
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

	userID := c.Get(USER_ID_KEY).(int)
	h.chatConns[userID] = senderConn

	for {
		var payload WebsocketPayload

		_, raw, err := senderConn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				c.Logger().Error(err)
			}
			break
		}

		if err := json.Unmarshal(raw, &payload); err != nil {
			c.Logger().Error(err)
			continue
		}
		if err := c.Validate(payload); err != nil {
			c.Logger().Error(err)
			continue
		}

		switch payload.Type {
		case NewMessage:
			if err := insertMessage(c.Request().Context(), h, payload.Data, raw); err != nil {
				c.Logger().Error(err)
				continue
			}
		case OpenChatbox:
			if err := updateMessageReadAt(c.Request().Context(), h, payload.Data, userID); err != nil {
				c.Logger().Error(err)
				continue
			}
		default:
			c.Logger().Errorf("unknown message type received: %v", payload.Type)
		}

	}
	return nil
}

func insertMessage(context context.Context, h *handler, data interface{}, raw []byte) error {
	var (
		msg Message
	)

	s, err := json.Marshal(data)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(s, &msg); err != nil {
		return err
	}

	h.lock.Lock()
	if _, err := h.db.Exec(context, "INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES ($1, $2, $3, $4)", msg.SenderID, msg.ReceiverID, msg.Content, msg.CreatedAt); err != nil {
		return err
	}
	h.lock.Unlock()
	receiverConn, ok := h.chatConns[msg.ReceiverID]
	if !ok {
		return nil
	}
	if err := receiverConn.WriteMessage(websocket.TextMessage, raw); err != nil {
		return err
	}
	return nil
}

func updateMessageReadAt(context context.Context, h *handler, data interface{}, selfID int) error {
	var (
		otherID int
	)

	s, err := json.Marshal(data)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(s, &otherID); err != nil {
		return err
	}

	h.lock.Lock()
	if _, err := h.db.Exec(context, "UPDATE messages SET read_at = now() WHERE sender_id = $1 AND receiver_id = $2", otherID, selfID); err != nil {
		return nil
	}
	h.lock.Unlock()

	return nil
}
