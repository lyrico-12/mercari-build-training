package app

import (
	"context"
	"encoding/json"
	"errors"

	// STEP 5-1: uncomment this line
	// _ "github.com/mattn/go-sqlite3"
	"os"
)

var errImageNotFound = errors.New("image not found")

type Item struct {
	ID   int    `db:"id" json:"-"`
	Name string `db:"name" json:"name"`
}

// Please run `go generate ./...` to generate the mock implementation
// ItemRepository is an interface to manage items.
//
//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -package=${GOPACKAGE} -destination=./mock_$GOFILE
type ItemRepository interface {
	Insert(ctx context.Context, item *Item) error
}

// itemRepository is an implementation of ItemRepository
type itemRepository struct {
	// fileName is the path to the JSON file storing items.
	fileName string
}

// NewItemRepository creates a new itemRepository.
func NewItemRepository() ItemRepository {
	return &itemRepository{fileName: "items.json"}
}

// Insert inserts an item into the repository.
func (i *itemRepository) Insert(ctx context.Context, item *Item) error {
	// STEP 4-1: add an implementation to store an item
	
	// データ格納のための構造体
	var data struct {
		Items []Item `json:"items"`
	}

	file, err := os.OpenFile(i.fileName, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	// ファイルの中身をデコード
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil && err.Error() != "EOF" {
		return err
	}

	data.Items = append(data.Items, *item)

	file.Truncate(0)
	file.Seek(0, 0)

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}

// StoreImage stores an image and returns an error if any.
// This package doesn't have a related interface for simplicity.
func StoreImage(fileName string, image []byte) error {
	// STEP 4-4: add an implementation to store an image

	return nil
}
