files = main.go
out = ./bin/kittenchat

run:
	@go run $(files)

build:
	@go build -o $(out) $(files) 

preview: build
	@$(out)
