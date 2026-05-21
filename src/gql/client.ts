import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { store } from '../redux/store'

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
})

// Attach JWT from Redux
const authLink = new ApolloLink((operation, forward) => {
  const token = store.getState().auth.token
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }))
  return forward(operation)
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

