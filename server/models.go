package main

import "time"

type (
	User struct {
		ID        int       `json:"id"`
		Username  string    `json:"username"`
		CreatedAt time.Time `json:"created_at"`
	}

	Message struct {
		SenderID   int        `json:"sender_id" validate:"required"`
		ReceiverID int        `json:"receiver_id" validate:"required"`
		Content    string     `json:"content" validate:"required"`
		CreatedAt  time.Time  `json:"created_at" validate:"required"`
		ReadAt     *time.Time `json:"read_at"`
	}

	UserInfo struct {
		ID          int        `json:"id"`
		Username    string     `json:"username"`
		Content     *string    `json:"content"`
		CreatedAt   *time.Time `json:"created_at"`
		UnreadCount *int       `json:"unread_count"`
	}

	PayloadType      string
	WebsocketPayload struct {
		Type PayloadType `json:"type"`
		Data interface{} `json:"data"`
	}
)

const (
	NewMessage  PayloadType = "NEW_MESSAGE"
	OpenChatbox PayloadType = "OPEN_CHATBOX"
)
