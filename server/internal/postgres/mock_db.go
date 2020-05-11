package postgres

import (
	"context"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
)

type MockDB struct {
	callParams []interface{}
}

func (mdb *MockDB) Exec(ctx context.Context, sql string, arguments ...interface{}) (pgconn.CommandTag, error) {
	mdb.callParams = []interface{}{sql}
	mdb.callParams = append(mdb.callParams, arguments...)

	return nil, nil
}

func (mdb *MockDB) Query(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
	return nil, nil
}

func (mdb *MockDB) QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row {
	return nil
}

func (mdb *MockDB) SendBatch(ctx context.Context, b *pgx.Batch) pgx.BatchResults {
	return nil
}

func (mdb *MockDB) CalledWith() []interface{} {
	return mdb.callParams
}
