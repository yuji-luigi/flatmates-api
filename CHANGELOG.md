# Changelog

## [1.2.1](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.2.0...flatmates-api-v1.2.1) (2024-07-18)


### Bug Fixes

* docker ignore tests ([11f1dbd](https://github.com/yuji-luigi/flatmates-api/commit/11f1dbd333dd49364ea7f352f5adcf25dca5660f))

## [1.2.0](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.12...flatmates-api-v1.2.0) (2024-07-18)


### Features

* Add functionality to send new verification email for a unit inhabitant ([1b4f143](https://github.com/yuji-luigi/flatmates-api/commit/1b4f143beada7aba9ff0ce049b8a23fffe0e78ab))
* Add functionality to send new verification email for a unit inhabitant ([9c674b4](https://github.com/yuji-luigi/flatmates-api/commit/9c674b4f7883c1baddce1a3b985b4ae25bd7b4ee))
* Add generateSecureRandomString function for generating secure random strings ([b324597](https://github.com/yuji-luigi/flatmates-api/commit/b324597bb3f78f74bc33b9d1a4d17c55332748b8))
* Add locale support for user registration ([1634d39](https://github.com/yuji-luigi/flatmates-api/commit/1634d39effc9e7e76cc4435c13867473351d8b18))
* Add nonce verification for linkId ([fcecd1b](https://github.com/yuji-luigi/flatmates-api/commit/fcecd1b509039257708336505d0f4c4765d7753e))
* Add nonce verification for linkId ([628beb6](https://github.com/yuji-luigi/flatmates-api/commit/628beb66fc7b93dfbe6ebd18f94b12983a623f57))
* Add pre-registration with email verification ([22fdd6f](https://github.com/yuji-luigi/flatmates-api/commit/22fdd6f3f3dd84a38543e7988ea58e11aee51928))
* adding  print with qrcode endpoint for frontend ([1d6490e](https://github.com/yuji-luigi/flatmates-api/commit/1d6490e480a97506bcbfe47f837a0f9feb976c72))
* **enhance:** added validatedAt in AuthToken model to know when it is been used. ([4b0c9ce](https://github.com/yuji-luigi/flatmates-api/commit/4b0c9ce817c40eb86d5ac8f3164772aad71c0eec))
* **enhance:** register from qrcode. already pending-verification users can re do the registration ([12f3d03](https://github.com/yuji-luigi/flatmates-api/commit/12f3d030b922797b76e95bd047736e09a9442fde))
* **enhance:** register from qrcode. already pending-verification users can re do the registration ([e8b3f96](https://github.com/yuji-luigi/flatmates-api/commit/e8b3f969e77ab8e027e87518fcef228fb665814d))
* inhabitant invitation acceptance by login testing ([7fde890](https://github.com/yuji-luigi/flatmates-api/commit/7fde8901617fc879f71d74634b1b3734f76626e6))
* invitation ([62bd2a6](https://github.com/yuji-luigi/flatmates-api/commit/62bd2a6c249c195e0cb368813af1924fc43faa9d))
* **Invitation accept by logging in:** not logged user can accept invitation by logging in ([38b01c7](https://github.com/yuji-luigi/flatmates-api/commit/38b01c7e353e1f499c9912d380ac15791bb97872))
* invitation routes and logics ([794d05e](https://github.com/yuji-luigi/flatmates-api/commit/794d05eb35f84844a9604be2e4ae72e6e4471c49))
* new accessPermission middleware API is now available in isLoggedIn.ts ([a16b276](https://github.com/yuji-luigi/flatmates-api/commit/a16b2767501f55dccc7462c50122e57ef8e69a4c))
* qrcode for new units ([4519c84](https://github.com/yuji-luigi/flatmates-api/commit/4519c849f6b1999c97ab05f6d9f1089dfefb5587))
* Remove commented code and update handleUserFromRequest middleware ([6020b3c](https://github.com/yuji-luigi/flatmates-api/commit/6020b3c9e105de06f5788fa5c2c715e87c37ef8f))
* remove user from unit functionality ([b6ca5b1](https://github.com/yuji-luigi/flatmates-api/commit/b6ca5b18f89655e2e7430ef1f03b9cc10d0ab1c9))
* send email at register by physical letter qrcode ([19b9f7a](https://github.com/yuji-luigi/flatmates-api/commit/19b9f7ac7d77f6fc07eb6a414ca6b705ace5d2f3))
* Set 'active' flag to true when renewing auth tokens ([cd0af81](https://github.com/yuji-luigi/flatmates-api/commit/cd0af814c77acfa15343fd126c9740cf6ad5d9c8))
* space delete on cascade function + parent ids for accessPermission Control ([96472c2](https://github.com/yuji-luigi/flatmates-api/commit/96472c25fdcd2193668470dc6ce8156075850100))
* Space model onSave handle isTail value ([69e9fc1](https://github.com/yuji-luigi/flatmates-api/commit/69e9fc14fe40eaef0047df32abf49a230c67f4c1))
* unit creation from flatmate excel ([f6ad965](https://github.com/yuji-luigi/flatmates-api/commit/f6ad96569be7daa41290c772b05a1f29eb391f91))
* Update AuthToken model to include isNotValidValidatedAt method ([d21f3e8](https://github.com/yuji-luigi/flatmates-api/commit/d21f3e878ae14072a93bc1382a3e04ba04fd1c45))
* Update verifEmailRootFrontend variable in globalVariables.ts ([e3df267](https://github.com/yuji-luigi/flatmates-api/commit/e3df267243e32b5ccfaff869ebc373d68b447c95))
* Update verification email status to 'verified' ([9a78750](https://github.com/yuji-luigi/flatmates-api/commit/9a78750236bc6ffeaaf8d91635f286dc907f16b8))
* user locale change ([3226aa6](https://github.com/yuji-luigi/flatmates-api/commit/3226aa616eeae2b3d7ee4d5211598b7021db3fc5))


### Bug Fixes

* accept invitation ([eb5d719](https://github.com/yuji-luigi/flatmates-api/commit/eb5d719ca0845dc98bdcfa70073361760baad001))
* active in user by type abstractClass ([dd49723](https://github.com/yuji-luigi/flatmates-api/commit/dd4972318068970eaf84ca929bbf32f70822fbd9))
* Add required field for acceptedAt in Invitation and Unit models ([d562e2c](https://github.com/yuji-luigi/flatmates-api/commit/d562e2c5e640c8514906215595311388fd1682bd))
* adding all units with authToken ([0e083e3](https://github.com/yuji-luigi/flatmates-api/commit/0e083e3102831c30d5cc23beb79567d38a07c40a))
* adding invitation feature ([80123f1](https://github.com/yuji-luigi/flatmates-api/commit/80123f1a64f2048f396cf965267f87230aa80bd8))
* **backward compatibility:** verifPinFromRequest function idMongoose is optional ([031e692](https://github.com/yuji-luigi/flatmates-api/commit/031e6928bbf22b610d65255df9c14b8a3dcc56b0))
* **big change:** isLoggedIn middleware only checks user.currentSpace._id ([592bfdc](https://github.com/yuji-luigi/flatmates-api/commit/592bfdcbabdc96cac308b6060ca0bd0ed631de62))
* **bug fix:** getMaintenances's maintainer lookup updated ([ad15010](https://github.com/yuji-luigi/flatmates-api/commit/ad150101c6735fe3d65277108c779f17e3dbe81e))
* change folder in excel dir. import flatmates logic updates ([373da97](https://github.com/yuji-luigi/flatmates-api/commit/373da973676f06dfb72b09275b74e9a0c15477f4))
* Creation of units inhabitant invitations users and spaces by import excel ([29aa843](https://github.com/yuji-luigi/flatmates-api/commit/29aa843b4649ab090bb9e5a08afb4451409f97a4))
* crud GET /units/with-pagination. update by importing units excel. ([2c72d7d](https://github.com/yuji-luigi/flatmates-api/commit/2c72d7da85c29df482e24fad384422456171d6dc))
* **directory update:** :recycle: refactor view directory email templates into lib/nodemailer ([2585426](https://github.com/yuji-luigi/flatmates-api/commit/2585426f73e2f1ecb5b06ec1032a3ad254c529e7))
* **directory update:** :recycle: refactor view directory email templates into src/email-template ([44160f1](https://github.com/yuji-luigi/flatmates-api/commit/44160f1bde1c4c9c80a5629628dc52dc735449ef))
* **each user type:** Refactor user-by-user-type models and update query handling ([3e867cf](https://github.com/yuji-luigi/flatmates-api/commit/3e867cf9ff3c6a98c6e9a515c4b9ac3753d4dd55))
* **enhance:** fix(enhance):  ([514de67](https://github.com/yuji-luigi/flatmates-api/commit/514de670479dd48d58fe59892636f90c4da677e1))
* **enhance:** role checking was not working in isloggedin middlewaere (checkPermission) ([3b2d415](https://github.com/yuji-luigi/flatmates-api/commit/3b2d41569d43870fa118bf24f9b6f70775ea0dae))
* idle ([a616f05](https://github.com/yuji-luigi/flatmates-api/commit/a616f05ddcbe7d7a70fc8791a398ffbb49cc949e))
* idle setting authToken logic for register email verification ([db33bf3](https://github.com/yuji-luigi/flatmates-api/commit/db33bf38f30753950cdfb70488af8f12ed26767b))
* **idle:** Add file upload support to userByUserType routes ([1b2af0f](https://github.com/yuji-luigi/flatmates-api/commit/1b2af0f0c85d7174b6260f2125a9e48c2d01af28))
* **idle:** Adding logic to invite each inhabitant for each unit in tail space via import excel ([74370bf](https://github.com/yuji-luigi/flatmates-api/commit/74370bfdeaa475657695e546bb7b994d6ea56c58))
* **idle:** Refactor user-by-user-type models and update query handling ([dbd53ed](https://github.com/yuji-luigi/flatmates-api/commit/dbd53edfaf0c8e7c07e869365308b5db3e758b78))
* import excel for units added invitation type on creation. GET authToken by invitation added additional match stage in pipeline ([9c1ab05](https://github.com/yuji-luigi/flatmates-api/commit/9c1ab05ae2231586f5e0b8f30ee56ebf98c270dc))
* import flatmate as a response send units ([56c432c](https://github.com/yuji-luigi/flatmates-api/commit/56c432c97f94e79a58ca829ff130619dae9c1b03))
* import units to register user in one unit ([7ea224a](https://github.com/yuji-luigi/flatmates-api/commit/7ea224a8b5635edb1270f8ef0227bda518ba253e))
* invitation model now authToken is required ([e979126](https://github.com/yuji-luigi/flatmates-api/commit/e979126c8ae462b981ed84008aabf94efd513364))
* Invite user function now in invitations route ([4cf757b](https://github.com/yuji-luigi/flatmates-api/commit/4cf757b65d5ddf060445fd695dd6986fd0a4fb79))
* new logic for register new by unknown email pending ([fff8b18](https://github.com/yuji-luigi/flatmates-api/commit/fff8b189ae2b0edb5b182381b804ed5d1ebeb676))
* node mailer functions and directory ([203f759](https://github.com/yuji-luigi/flatmates-api/commit/203f759112464bac108e02c359b743f406535a79))
* property manager register ([c2e8271](https://github.com/yuji-luigi/flatmates-api/commit/c2e8271a25f0861f9a0e6bc5cc479468c56f0c0f))
* Refactor user-by-user-type models and update query handling ([20606ab](https://github.com/yuji-luigi/flatmates-api/commit/20606abd1118b752cf4a477a4740638172061888))
* Refactor user-by-user-type models and update query handling ([6f542c0](https://github.com/yuji-luigi/flatmates-api/commit/6f542c0c8e5b1da465f8a17d2509bc8f1322171d))
* Refactor user-by-user-type models and update query handling ([34fa383](https://github.com/yuji-luigi/flatmates-api/commit/34fa38365cf454a0589f217ef7bc5a034c4a85b7))
* **refactor:** getFilterOptions remove duplicates ([921401c](https://github.com/yuji-luigi/flatmates-api/commit/921401c7948b68903924159410bca99693c03cfc))
* **refactoring:** fix(refactoring):  ([35f6141](https://github.com/yuji-luigi/flatmates-api/commit/35f6141442ab7565c318cd11fb239fe60a16ca2d))
* register by qrcode ([3f8f354](https://github.com/yuji-luigi/flatmates-api/commit/3f8f354dc2a8797dc11573a15ec9350407af7a65))
* rename route maintainers to be maintainer ([ca41cb7](https://github.com/yuji-luigi/flatmates-api/commit/ca41cb7407acec31a36e43219a36a0d3667096ad))
* **renaming:** :pencil2: verifficationEmail file name ([da0d978](https://github.com/yuji-luigi/flatmates-api/commit/da0d97822970e70824af98db98b0b3ee78e44198))
* send also _id of authToken (print unit frontend) ([f1087c9](https://github.com/yuji-luigi/flatmates-api/commit/f1087c98f34ad0462da870305542929b0d5fa791))
* **small fix:** pass renew qrcode route to isLoggedIn middleware ([bdc56a6](https://github.com/yuji-luigi/flatmates-api/commit/bdc56a668e9be5dfaeb6d29abbeab0429db07640))
* **small fix:** renew authtoken deletes validatedAt ([ea8ce39](https://github.com/yuji-luigi/flatmates-api/commit/ea8ce3952aa59abd599933e982cafc9b18049b71))
* **small fix:** spaceId in isLoggedIn middleware toString() objectId ([d4ea78a](https://github.com/yuji-luigi/flatmates-api/commit/d4ea78aedcb5ffaf45a42bd78a014ac3010c4c38))
* **small fix:** verify inhabitant email associate unit and user ([c579376](https://github.com/yuji-luigi/flatmates-api/commit/c57937608a7635c12ecdd6bc540597f1cc475b12))
* **small fix:** without choosing current space you can renew qrcode from frontend ([16a4191](https://github.com/yuji-luigi/flatmates-api/commit/16a4191ba20d3367ead744dea0213729edd53eaf))
* **typings:** BulkWriteOperation ([f07b519](https://github.com/yuji-luigi/flatmates-api/commit/f07b51985eee6f59cd82f2cee4f3f00dde33e01f))
* typo ([2433823](https://github.com/yuji-luigi/flatmates-api/commit/2433823b9c1da5afab1e4e099a2c8179c275c61a))
* Update imports from 'bson' to 'mongodb' in JwtPayload.ts, ErrorCustom.ts, spacePipelines.ts, space-tag.ts, jwtTypings.ts, thread-interface.ts, access-permission-interface.ts, notification-interface.ts, user-space-conjunction-interface.ts, and maintainer-interface.ts ([261143d](https://github.com/yuji-luigi/flatmates-api/commit/261143dc1d024029ff505fdfbd57c4e9f55aa139))
* user email duplication message ([ee96f5c](https://github.com/yuji-luigi/flatmates-api/commit/ee96f5c64ab89e401f852a87072c12e6e0bd4e71))
* verification email logics and models ([181f5f0](https://github.com/yuji-luigi/flatmates-api/commit/181f5f08b808c28f49bd952f37faaea3e3a3661b))
* verification email logics and models ([61169da](https://github.com/yuji-luigi/flatmates-api/commit/61169da7dd62574474ce3f1274f62d9434908d97))

## [1.1.12](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.11...flatmates-api-v1.1.12) (2024-04-10)


### Bug Fixes

* Add new files and update query handling ([10bbfc6](https://github.com/yuji-luigi/flatmates-api/commit/10bbfc6b93f36e8dd3807cd9ef58d12af21d5c3b))
* **comments:** delete commented codes ([587f6b5](https://github.com/yuji-luigi/flatmates-api/commit/587f6b58d59a48416ee3ffeb31d386abece65eb6))
* **refactoring:** Add new user-by-user-type models and update query handling ([f50cfa5](https://github.com/yuji-luigi/flatmates-api/commit/f50cfa57e83b6b5e0f13167ab99fd37516ac991c))
* **refactor:** Refactor user-by-user-type models and update query handling ([e688a6e](https://github.com/yuji-luigi/flatmates-api/commit/e688a6e56db48e30d7cb7dbfb356f58ce1b1f0d6))
* **role name:** toLowerCase and snake case system_admin Update role names to lowercase ([5bb1117](https://github.com/yuji-luigi/flatmates-api/commit/5bb1117621a14137bb39ca769b580d532b6374f2))
* space cookies refactoring, only space Id in cookie. Remove unused imports and commented code ([37205c2](https://github.com/yuji-luigi/flatmates-api/commit/37205c262169e3316885970196fc34b4eefc326e))
* **system admin menu:** exit system admin + switch to system admin route+controller ([935d7df](https://github.com/yuji-luigi/flatmates-api/commit/935d7df7f8a8a7416c04f2ab9f6fa4d2c6f93654))
* **system admin menu:** save prevLoggedAs in Jwt and resolve in resolve function. typings updated ([bac0f64](https://github.com/yuji-luigi/flatmates-api/commit/bac0f64758867f8d7afa2b5a8e35d91b64fd47bc))
* **system_admin:** system_admin checkroute /auth/system-admin/:idSpace mongoose ([619347f](https://github.com/yuji-luigi/flatmates-api/commit/619347f544600cd7b5452a167bcd55a660e33e8e))
* Update role names and labels ([bbeadf0](https://github.com/yuji-luigi/flatmates-api/commit/bbeadf0a8abb0a0be547d4fee0607813b106704f))

## [1.1.11](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.10...flatmates-api-v1.1.11) (2024-03-22)


### Bug Fixes

* Add console.log to check if user is a system admin ([5b0e4c5](https://github.com/yuji-luigi/flatmates-api/commit/5b0e4c5900ac7029654dc2a992c4ab6fd6e65db2))
* idle fix authToken model and creation of maintenances ([0ffdb13](https://github.com/yuji-luigi/flatmates-api/commit/0ffdb1314078977b6f0e1c423fec6dd9f0f425d2))
* packages ([740db95](https://github.com/yuji-luigi/flatmates-api/commit/740db951ff7a656e306307e1bf290759d6cae52b))
* Update access permission names and refactor auth middleware ([b749052](https://github.com/yuji-luigi/flatmates-api/commit/b74905264e6bb48db62fcb12daa76c5e78dc5ba9))

## [1.1.10](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.9...flatmates-api-v1.1.10) (2024-03-16)


### Bug Fixes

* cache test ([b339326](https://github.com/yuji-luigi/flatmates-api/commit/b339326710d2935ce4422b90a947bd2179b370f4))

## [1.1.9](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.8...flatmates-api-v1.1.9) (2024-03-16)


### Bug Fixes

* fix:  ([8c8341b](https://github.com/yuji-luigi/flatmates-api/commit/8c8341bc2e2f5dbefba6492c22e3e685f6091b54))

## [1.1.8](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.7...flatmates-api-v1.1.8) (2024-03-16)


### Bug Fixes

* fix:  ([7fe9d0f](https://github.com/yuji-luigi/flatmates-api/commit/7fe9d0ff8f42a3cd3ffd738109b0b0e7d80f3f63))

## [1.1.7](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.6...flatmates-api-v1.1.7) (2024-03-16)


### Bug Fixes

* test caching ([1300f95](https://github.com/yuji-luigi/flatmates-api/commit/1300f953add87713c4c9934f8bbf7996d653cd54))

## [1.1.6](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.5...flatmates-api-v1.1.6) (2024-03-16)


### Bug Fixes

* fix:  ([ddd78d1](https://github.com/yuji-luigi/flatmates-api/commit/ddd78d14dc48cf86b445f2f4a82a2a2def8ad9cb))

## [1.1.5](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.4...flatmates-api-v1.1.5) (2024-03-16)


### Bug Fixes

* fix:  ([9681c88](https://github.com/yuji-luigi/flatmates-api/commit/9681c88f4a297c8156f80cda1163b7a44510594b))
* fix:  ([96e1f25](https://github.com/yuji-luigi/flatmates-api/commit/96e1f253865f44499cdf4abda8235ac4788f962a))

## [1.1.4](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.3...flatmates-api-v1.1.4) (2024-03-16)


### Bug Fixes

* cache ([f985148](https://github.com/yuji-luigi/flatmates-api/commit/f98514801b2199375efd6e97042d902e298653d0))

## [1.1.3](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.2...flatmates-api-v1.1.3) (2024-03-16)


### Bug Fixes

* fix:  ([f41947d](https://github.com/yuji-luigi/flatmates-api/commit/f41947de27ed3c94edd900c6540df0f38f707c78))

## [1.1.2](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.1...flatmates-api-v1.1.2) (2024-03-16)


### Bug Fixes

* service name ([fe0fda9](https://github.com/yuji-luigi/flatmates-api/commit/fe0fda9ed8a843a8e47a4ea04397a021aa2dfcc5))

## [1.1.1](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.1.0...flatmates-api-v1.1.1) (2024-03-15)


### Bug Fixes

* Refactor error message handling in error middleware ([8130345](https://github.com/yuji-luigi/flatmates-api/commit/81303459257d986204d9b108d4b367016d73b3ee))
* type ([e4d5187](https://github.com/yuji-luigi/flatmates-api/commit/e4d518740131d970fb3aaaff775c5c5558d77eba))

## [1.1.0](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.0.0...flatmates-api-v1.1.0) (2024-03-15)


### Features

* new ([6f5d243](https://github.com/yuji-luigi/flatmates-api/commit/6f5d2436ad0787cbd55363b6e26f286372cde664))


### Bug Fixes

* 0 ([ac00dbc](https://github.com/yuji-luigi/flatmates-api/commit/ac00dbc856e19eae00c743da1bb5a9c61f1f0a98))
* docker compse command ([6b98a50](https://github.com/yuji-luigi/flatmates-api/commit/6b98a500aa5dcb5727fbcb94fc4eefe738b14f75))

## 1.0.0 (2024-03-15)


### Bug Fixes

* 0 ([ac00dbc](https://github.com/yuji-luigi/flatmates-api/commit/ac00dbc856e19eae00c743da1bb5a9c61f1f0a98))
* docker compse command ([6b98a50](https://github.com/yuji-luigi/flatmates-api/commit/6b98a500aa5dcb5727fbcb94fc4eefe738b14f75))
* release ([ecabda3](https://github.com/yuji-luigi/flatmates-api/commit/ecabda3ffed729a9cac25476ef8dce9aa4f700b0))
* release please ([b973a81](https://github.com/yuji-luigi/flatmates-api/commit/b973a81400b2158b6c296f0966ffde3c159596da))
* start from v 0.0.0 ([a7c42c9](https://github.com/yuji-luigi/flatmates-api/commit/a7c42c9b868d24f39a3eec8276470092e5d194cd))
* types ([68053b4](https://github.com/yuji-luigi/flatmates-api/commit/68053b4b1e231e95fd8611eedc0e0e688c1769fd))
* user undefined in isLoggedIn ([e670580](https://github.com/yuji-luigi/flatmates-api/commit/e670580a9c461022a04343117fd46162852b8642))

## 1.0.0 (2024-03-15)


### Bug Fixes

* release ([ecabda3](https://github.com/yuji-luigi/flatmates-api/commit/ecabda3ffed729a9cac25476ef8dce9aa4f700b0))
* release please ([b973a81](https://github.com/yuji-luigi/flatmates-api/commit/b973a81400b2158b6c296f0966ffde3c159596da))
* start from v 0.0.0 ([a7c42c9](https://github.com/yuji-luigi/flatmates-api/commit/a7c42c9b868d24f39a3eec8276470092e5d194cd))
* types ([68053b4](https://github.com/yuji-luigi/flatmates-api/commit/68053b4b1e231e95fd8611eedc0e0e688c1769fd))
* user undefined in isLoggedIn ([e670580](https://github.com/yuji-luigi/flatmates-api/commit/e670580a9c461022a04343117fd46162852b8642))

## [1.0.1](https://github.com/yuji-luigi/flatmates-api/compare/flatmates-api-v1.0.0...flatmates-api-v1.0.1) (2024-03-15)


### Bug Fixes

* release ([ecabda3](https://github.com/yuji-luigi/flatmates-api/commit/ecabda3ffed729a9cac25476ef8dce9aa4f700b0))
* release please ([b973a81](https://github.com/yuji-luigi/flatmates-api/commit/b973a81400b2158b6c296f0966ffde3c159596da))
* user undefined in isLoggedIn ([e670580](https://github.com/yuji-luigi/flatmates-api/commit/e670580a9c461022a04343117fd46162852b8642))
