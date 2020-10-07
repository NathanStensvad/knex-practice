require('dotenv').config()
const knex = require('knex')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL
})

console.log('knex and driver installed correctly');

//1

function searchByName(searchTerm) {
    knexInstance
        .select('id', 'name', 'price', 'date_added', 'checked', 'category')
        .from('shopping_list')
        .where('name', 'ILIKE', `${searchTerm}`)
        .then(result => {
            console.log('Finding ' + searchTerm)
            console.log(result)
        })
}

searchByName('burgatory')

//2

function paginateList(pageNumber) {
    const itemsPerPage = 6
    const offset = itemsPerPage * (pageNumber - 1)
    knexInstance
        .select('id', 'name', 'price', 'date_added', 'checked', 'category')
        .from('shopping_list')
        .limit(itemsPerPage)
        .offset(offset)
        .then(result => {
            console.log('Page ' + pageNumber)
            console.log(result)
        })
}

paginateList(2)

//3

function getItemsAfterDate(daysAgo) {
    knexInstance
        .select('id', 'name', 'price', 'date_added', 'checked', 'category')
        .where(
            'date_added',
            '<',
            knexInstance.raw(`now() - '?? days':: INTERVAL`, daysAgo)
        )
        .from('shopping_list')
        .then(result => {
            console.log('Items added ' + daysAgo + ' or more days ago')
            console.log(result)
        })
}

getItemsAfterDate(5)

//4

function totalCost() {
    knexInstance
        .select('category')
        .from('shopping_list')
        .sum('price as total')
        .groupBy('category')
        .then(result => {
            console.log('Total price:')
            console.log(result)
        })
}

totalCost()