const ShoppingListService = require('../src/shopping-list-service')
const knex = require('knex')

describe(`Shopping List service object`, function () {
    let db

    let testList = [
        {
            id: 1,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            name: 'First test post!',
            price: 42,
            checked: false,
            category: 'Breakfast'
        },
        {
            id: 2,
            date_added: new Date('2100-05-22T16:28:32.615Z'),
            name: 'Second test post!',
            price: 5362,
            checked: false,
            category: 'Snack'
        },
        {
            id: 3,
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            name: 'Third test post!',
            price: 4,
            checked: false,
            category: 'Lunch'
        },
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    before(() => db('shopping_list').truncate())

    afterEach(() => db('shopping_list').truncate())

    after(() => db.destroy())

    context(`Given 'shopping_list' has data`, () => {
        beforeEach=(() => {
            return db
                .into('shopping_list')
                .insert(testList)
        })

        it(`getAllItems() resolves all items from 'shopping_list' table`, () => {
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql(testList.map(item => ({
                        ...item,
                        date_added: new Date(item.date_added)
                    })))
                })
        })

        it(`getById() resolves an item by id from 'shopping_list' table`, () => {
            const thirdId = 3
            const thirdTestItem = testList[thirdId - 1]
            return ShoppingListService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestItem.name,
                        price: thirdTestItem.price,
                        checked: thirdTestItem.checked,
                        category: thirdTestItem.category,
                        date_added: thirdTestItem.date_added,
                    })
                })
        })

        it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
            const itemId = 3
            return ShoppingListService.deleteItem(db, itemId)
                .then(() => ShoppingListService.getAllItems(db))
                .then(allItems => {
                    const expected = testList.filter(item => item.id !== itemId)
                    expect(allItems).to.eql(expected)
                })
        })

        it(`updateItem() updates an item from the 'shopping_list' table`, () => {
            const idOfItemToUpdate = 3
            const newItemData = {
                name: 'updated name',
                price: 9001,
                date_added: new Date(),
                checked: true,
                category: 'Main'
            }
            const originalItem = testList[idOfItemToUpdate = 1]
            return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
                .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
                .then(item => {
                    expect(item).to.eql({
                        id: idOfItemToUpdate,
                        ...originalItem,
                        ...newItemData,
                    })
                })
        })
    })

    context(`Given 'shopping_list' has no data`, () => {
        it(`getAllItems() resolves an empty array`, () => {
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
            const newItem = {
                name: 'Test new name',
                price: 9001,
                date_added: new Date('2020-01-01T00:00:00.000Z'),
                checked: true,
                category: 'Main'
            }
            return ShoppingListService.insertItem(db, newItem)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newItem.name,
                        price: newItem.price,
                        date_added: new Date(newItem.date_added),
                        checked: newItem.checked,
                        category: newItem.category,
                    })
                })
        })
    })


})

