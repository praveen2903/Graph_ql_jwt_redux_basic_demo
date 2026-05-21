# TODO - GraphQL JWT Redux + React Hook Form (TS) demo

## Backend (/server)
- [ ] Create /server package.json and tsconfig
- [ ] Implement PostgreSQL schema (users, skills, user_skills, security_questions, password_resets)
- [ ] Create GraphQL schema (typeDefs) + resolvers
- [ ] Implement JWT auth (login/register/me)
- [ ] Implement forgot password + security question flow
- [ ] Seed skills + security questions

## Frontend (root)
- [ ] Install deps: redux toolkit, react-redux, apollo client, graphql, react-hook-form, zod, @hookform/resolvers, react-select
- [ ] Create Redux store + auth/skills slices
- [ ] Configure Apollo Client to send Authorization header from Redux token
- [ ] Build Register form:
  - [ ] validations (zod)
  - [ ] Controller for select + multiselect
  - [ ] useFieldArray for skills
- [ ] Build Login form with validation
- [ ] Build Forgot password + security question verify forms
- [ ] After login: show Skills static page (from GraphQL)
- [ ] Add routing/state switching (logged in vs logged out)

## Run / Test
- [ ] Start Postgres, set env vars
- [ ] Run server (GraphQL endpoint)
- [ ] Run client (Vite)
- [ ] Validate: register -> login -> skills page -> logout

