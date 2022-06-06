# INTRVL. ⏱

Intrvl is a web app that allows users to create custom interval timers.

Timers consist of named sections, and users can skip to the next / previous sections. Text-to-Speech is also used to give the user the option of having an announcement spoken when the timer starts and ends, as well as announcing the name of each section as it starts. Users can also choose to make a timer public, so that it can be used by others, and users can make lists of their favorite timers (their own or other users' public timers) so they can get to them quickly.

[Try it out](https://intrvl.herokuapp.com/)

## Table of contents

- [🖼 Screenshots](#screenshots)
- [👀 Overview](#overview)
  - [🏔 The challenge](#the-challenge)
  - [🔗 Links](#links)
- [⚙️ My process](#my-process)
  - [🛠 Built with](#built-with)
  - [🧠 What I learned](#what-i-learned)
  - [🔎 Resources referenced](#resources-referenced)
- [🧑‍💻 Author](#author)

## Screenshot

![](./screenshot.png)

## Overview

### The challenge

Project requirements:

- A full-stack application
- Have complete restful routes for at least one model (GET, POST, PUT, DELETE)
- Utilize an ORM to create and interact with the database

Personal Goals:

- Minimum Viable Product (MVP)
  - [x] Allow users to sign up / login
  - [x] Allow users to create / edit / delete timers
  - [x] Allow users to view all their timers and use each
  - [x] Use a Text-to-Speech API to announce when a timer is starting and ending
- Stretch Goals:
  - [x] Allow timers to be repeated
  - [x] Allow timers to have 'sections'
    - [x] Allow sections to be rearranged
    - [ ] Allow sections to be repeated
  - [x] Allow users to add tags (categories) to timers
  - [x] Allow user to set some timers as public, and others as private
  - [x] Allow users to have timer section names be announced when that section starts
  - [x] Styling
    - [x] Use TailwindCSS
    - [x] Responsive design
    - [x] Dark mode
  - [ ] Allow users to duplicate an existing timer to use it as a template

### Links

- Live Site: [Hosted on Heroku](https://intrvl.herokuapp.com/)
- Original Project Pitch and Wireframes: [Github README](./projectPitch/README.md)

## Details

### Built with

- Backend: NodeJS, PostgreSQL, Sequelize, EJS
- Frontend: TailwindCSS, Flowbite, JavaScript
- Web Speech API

- The timer functionality was built with JavaScript, and relies on a fixed time-step engine, built for my previous project [Bodhi's Dreamworld](https://github.com/saulthebear/bodhi-dreamworld).
- Text-to-Speech relies on the native web speech synthesis API: [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Typed.js](https://github.com/mattboldt/typed.js/) was used for a text animation on the home page
- The app interacts with the PostgreSQL database through the Sequelize ORM
- Views are built with the Embedded JavaScript (EJS) templating language

### Entity Relationship Diagram (ERD)

![ERD](./Intrvl_ERD.png)

### Routes

| HTTP Verb | URL Pattern                          | Action  | Description                                  |
| --------- | ------------------------------------ | ------- | -------------------------------------------- |
| GET       | /                                    | Index   | Describe app, show nav links                 |
| GET       | /login                               | New     | Show login form                              |
| POST      | /login                               | Create  | Log user in, by setting a cookie             |
| GET       | /logout                              | Destroy | Log user out, by deleting a cookie           |
| POST      | /favorites/:timerId                  | Create  | Add timer to favorites                       |
| DELETE    | /favorites/:timerId                  | Destroy | Remove timer from favorites                  |
| GET       | /users/new                           | New     | Show form to sign up                         |
| POST      | /users                               | Create  | Create a new user                            |
| GET       | /users/:id                           | Show    | Show user profile and their timers           |
| GET       | /users/:id/edit                      | Edit    | Show form to update user profile             |
| PUT       | /users/:id                           | Update  | Update profile / credentials                 |
| DELETE    | /users/:id                           | Destroy | Delete user's account                        |
| GET       | /users/:id/favorites                 | Index   | Show users favorites                         |
| GET       | /timers                              | Index   | Show all public timers                       |
| GET       | /timers/:id                          | Show    | Show a specific timer                        |
| GET       | /timers/new                          | New     | Show form to create a new timer              |
| POST      | /timers                              | Create  | Create a new timer                           |
| GET       | /timers/:id/edit                     | Edit    | Show form to edit a timer                    |
| PUT       | /timers/:id                          | Update  | Update a timer                               |
| DELETE    | /timers/:id                          | Destroy | Delete a timer                               |
| POST      | /timers/:timerId/sections            | Create  | Create a new timer section                   |
| PUT       | /timers/:timerId/sections/:sectionId | Update  | Update a section                             |
| DELETE    | /timers/:timerId/sections/:sectionId | Destroy | Delete a timer section                       |
| POST      | /timers/:timerId/tag/:tagId          | Create  | Associate a tag with a timer                 |
| DELETE    | /timers/:timerId/tag/:tagId          | Destroy | Remove association between a tag and a timer |
| GET       | /tags/new                            | New     | Show form to create a tag                    |
| POST      | /tags                                | Create  | Create a new tag                             |
| GET       | /tags/:id                            | Index   | Show all timers associated with a tag        |
| GET       | /tags/:id/edit                       | Edit    | Show form to edit a tag                      |
| PUT       | /tags/:id                            | Update  | Update a tag                                 |
| DELETE    | /tags/:id                            | Destroy | Delete a tag                                 |

### What I learned

### Resources referenced

## Author

- Linkedin - [Stefan Vosloo](https://www.linkedin.com/in/stefan-vosloo/)
- Twitter - [@saulthebear](https://www.twitter.com/saulthebear)
