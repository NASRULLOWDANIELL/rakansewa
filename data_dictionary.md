# Data Dictionary - RakanSewa Database Schema

This document details the data dictionary for all tables in the **RakanSewa** database schema.

---

### Table: `users`
Stores user profile information, verification details, and matching preferences.

| Attribute Name | Description | Type | Additional Type Information | Default Value | M | U |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **id** | Primary key for identifying each user | Bigint | Auto-increment | - | Y | Y |
| **name** | Full name of the user | Varchar(255) | - | - | Y | N |
| **email** | User's email address for login | Varchar(255) | - | - | Y | Y |
| **password** | Hashed account password | Varchar(255) | Write-only | - | Y | N |
| **role** | User authorization level | Varchar(255) | 'Student', 'Owner', 'Admin' | - | Y | N |
| **isListedAsHousemate** | Toggle to show user on matches list | Boolean | - | false | N | N |
| **budget** | Monthly rental budget limit | Double | - | - | N | N |
| **lifestyle** | Description of daily habits | Varchar(255) | - | - | N | N |
| **sleepSchedule** | Sleeping schedule style | Varchar(255) | - | - | N | N |
| **phoneNumber** | User contact number | Varchar(255) | - | - | N | N |
| **allowContact** | Permit other users to see contact info | Boolean | - | false | N | N |
| **showWhatsapp** | Show direct link to WhatsApp chat | Boolean | - | false | N | N |
| **matricNumber** | Student matric identification number | Varchar(255) | - | - | N | N |
| **uitmEmail** | Verified student UiTM email address | Varchar(255) | - | - | N | N |
| **isStudentVerified** | Status of student matric verification | Boolean | - | false | N | N |
| **emailVerified** | Status of email verification | Boolean | - | false | N | N |
| **emailVerificationToken** | Token string for verification flow | Varchar(255) | - | - | N | N |
| **emailVerificationTokenExpiry** | Expiration timestamp of verification token | Timestamp | - | - | N | N |
| **authProvider** | Auth method used to log in | Varchar(255) | 'local', 'google' | - | N | N |
| **priority1** | Top matching compatibility preference | Varchar(255) | Compatibility Options | - | N | N |
| **priority2** | Second matching compatibility preference | Varchar(255) | Compatibility Options | - | N | N |
| **priority3** | Third matching compatibility preference | Varchar(255) | Compatibility Options | - | N | N |
| **profileImageUrl** | Profile avatar image file path | Varchar(255) | - | - | N | N |
| **linked_property_id** | Linked property relationship ID | Bigint | FK: properties(id) | - | N | N |

---

### Table: `properties`
Houses details of off-campus rental listings.

| Attribute Name | Description | Type | Additional Type Information | Default Value | M | U |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **id** | Primary key for identifying each listing | Bigint | Auto-increment | - | Y | Y |
| **title** | Headline title of the rental house | Varchar(255) | - | - | Y | N |
| **description** | Informative description of listing details | Text | - | - | N | N |
| **address** | Listing geographical street address | Varchar(255) | - | - | Y | N |
| **city** | City location | Varchar(255) | - | - | Y | N |
| **state** | Malaysian state | Varchar(255) | - | - | Y | N |
| **monthlyRent** | Monthly rent price rate (RM) | Double | - | - | Y | N |
| **roomType** | Accommodation room category | Varchar(255) | 'Single', 'Master', 'Middle' | - | Y | N |
| **propertyType** | Structural building type | Varchar(255) | 'Apartment', 'Terrace', 'Condo' | - | Y | N |
| **furnishedStatus** | Listing furnishing levels | Varchar(255) | 'Fully', 'Partially', 'Unfurnished' | - | Y | N |
| **availabilityStatus** | Occupancy status level | Varchar(255) | 'Available', 'Occupied' | - | Y | N |
| **ownerId** | Relational ID of listing landlord | Bigint | FK: users(id) | - | N | N |
| **imageUrl** | Listing main overview image link | Text | - | - | N | N |
| **latitude** | Map coordinate latitude | Double | - | - | N | N |
| **longitude** | Map coordinate longitude | Double | - | - | N | N |
| **approvalStatus** | Moderation approval status | Varchar(255) | 'Pending', 'Approved', 'Rejected' | 'Pending' | Y | N |
| **rejectionReason** | Explanation details for listing rejection | Text | - | - | N | N |
| **amenities** | Comma-separated list of amenities | Text | - | - | Y | N |
| **updatedAt** | Last listing modification timestamp | Timestamp | - | - | N | N |
| **changeLog** | Change details recorded during updates | Text | - | - | N | N |

---

### Table: `property_images`
Manages supplementary gallery pictures for properties.

| Attribute Name | Description | Type | Additional Type Information | Default Value | M | U |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **id** | Primary key for identifying each image | Bigint | Auto-increment | - | Y | Y |
| **imageUrl** | Supplementary image link | Text | - | - | Y | N |
| **property_id** | Parent property listing ID | Bigint | FK: properties(id) | - | Y | N |
| **createdAt** | Timestamp image was added | Timestamp | - | Current time | Y | N |

---

### Table: `property_updates`
Records historical states and logs of property listing updates.

| Attribute Name | Description | Type | Additional Type Information | Default Value | M | U |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **id** | Primary key identifying the update entry | Bigint | Auto-increment | - | Y | Y |
| **propertyId** | Target property listing ID | Bigint | - | - | Y | N |
| **title** | Listing title at the time of modification | Varchar(255) | - | - | Y | N |
| **imageUrl** | Listing cover photo link at modification | Varchar(255) | - | - | N | N |
| **city** | City location at modification | Varchar(255) | - | - | N | N |
| **state** | State location at modification | Varchar(255) | - | - | N | N |
| **changeLog** | Text detailing attribute diff changes | Text | - | - | N | N |
| **updatedAt** | Timestamp when changes occurred | Timestamp | - | - | Y | N |

---

### Table: `favorites`
Stores bookmarked listing instances per student account.

| Attribute Name | Description | Type | Additional Type Information | Default Value | M | U |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **id** | Primary key identifying the favorite entry | Bigint | Auto-increment | - | Y | Y |
| **userEmail** | Email of student who bookmarked | Varchar(255) | FK: users(email) | - | Y | N |
| **property_id** | Bookmarked listing ID | Bigint | FK: properties(id) | - | Y | N |

---

### Table: `feedbacks`
Captures student comments, proposals, or reports submitted to administrators.

| Attribute Name | Description | Type | Additional Type Information | Default Value | M | U |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **id** | Primary key identifying the feedback entry | Bigint | Auto-increment | - | Y | Y |
| **userId** | Relational ID of submitting user | Bigint | FK: users(id) | - | Y | N |
| **category** | Subject classification | Varchar(255) | 'Comment', 'Suggestion', 'Report' | - | Y | N |
| **subject** | Text brief summary heading | Varchar(255) | - | - | Y | N |
| **message** | Text narrative body details | Text | - | - | Y | N |
| **createdAt** | Timestamp feedback was submitted | Timestamp | - | Current time | Y | N |
| **isResolved** | Admin resolution marker | Boolean | - | false | Y | N |

---

### Table: `password_reset_tokens`
Stores tokens generated for password reset requests.

| Attribute Name | Description | Type | Additional Type Information | Default Value | M | U |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **id** | Primary key identifying the reset token | Bigint | Auto-increment | - | Y | Y |
| **token** | Unique reset verification token string | Varchar(255) | - | - | Y | Y |
| **user_id** | Relational ID of target user account | Bigint | FK: users(id) | - | Y | N |
| **expiresAt** | Expiration timestamp of verification token | Timestamp | - | - | Y | N |
| **used** | State indicating token utilization | Boolean | - | false | Y | N |
| **createdAt** | Timestamp token was created | Timestamp | - | Current time | Y | N |
