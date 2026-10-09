# SnapShare: Photo App Scaling Plan

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and view a feed containing photos from people they follow.

The following assumptions are used for the calculations:

- Registered users: 10,000,000.
- Daily active users: 10% of registered users.
- Each daily active user uploads 1 photo per day.
- Each daily active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Each photo also has one thumbnail of 50 KB.
- There are 86,400 seconds in a day and 365 days in a year.
- Each feed page request is counted as one feed view.
- Peak traffic is estimated at 5 times the average request rate.
- Every uploaded photo is retained for a full year, and storage calculations exclude replication, backups, and other metadata.
- For simplicity, 1 GB = 1,000 MB and 1 TB = 1,000 GB.

## 2. Traffic and Storage Estimates

### Daily Active Users

Daily active users are 10% of the 10 million registered users.

10,000,000 × 0.10 = 1,000,000 daily active users.

Therefore, SnapShare has approximately **1 million daily active users**.

### Photo Uploads Per Second

Each daily active user uploads one photo per day.

Daily uploads:

1,000,000 × 1 = 1,000,000 photos per day.

Average uploads per second:

1,000,000 ÷ 86,400 ≈ 11.57 uploads per second.

Therefore, the average upload rate is approximately **12 uploads per second**.

Estimated peak upload rate, using 5× average traffic:

11.57 × 5 ≈ 57.87 uploads per second.

Therefore, the peak upload rate is approximately **58 uploads per second**.

### Feed Views Per Second

Each daily active user views 50 feed pages per day.

Daily feed views:

1,000,000 × 50 = 50,000,000 feed views per day.

Average feed views per second:

50,000,000 ÷ 86,400 ≈ 578.70 feed views per second.

Therefore, the average feed rate is approximately **579 feed views per second**.

Peak feed views per second, using 5× average traffic:

578.70 × 5 ≈ 2,893.52 feed views per second.

Therefore, the peak feed rate is approximately **2,894 feed views per second**.

### Photo Storage Per Year

Each original photo is 2 MB, and each thumbnail is 50 KB.

For this estimate, 50 KB is treated as 0.05 MB.

Total storage per photo:

2 MB + 0.05 MB = 2.05 MB.

Daily storage growth:

1,000,000 × 2.05 MB = 2,050,000 MB per day.

This is approximately 2,050 GB, or 2.05 TB, per day.

Yearly storage growth:

2,050,000 MB × 365 = 748,250,000 MB per year.

This is approximately **748.25 TB per year**, including original photos and thumbnails.

Original photos alone require approximately 730 TB per year, while thumbnails require approximately 18.25 TB per year.

These figures represent new stored data and do not include backups, replicas, metadata, or temporary files. Actual provisioned capacity would need to be higher.

## 3. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view 50 feed pages per day but upload only one photo per day.

The system receives approximately 50 million feed views per day compared with 1 million photo uploads per day. This means the architecture should prioritize fast feed loading, caching, efficient database reads, and content delivery through a CDN. Uploads must still be reliable, but feed requests are much more frequent than uploads.

## 4. Why Photos Should Not Be Stored Inside the Database

Photo files are large binary objects that can consume significant database storage, increase backup sizes, and make database maintenance and scaling more expensive. Instead, original photos and thumbnails should be stored in object storage, which is designed to store large files reliably and scale economically. The database should store metadata such as photo IDs, user IDs, captions, timestamps, and object-storage keys or URLs.

## 5. Architecture Diagram

```text
                         USERS
                           |
             +-------------+-------------+
             |                           |
             v                           v
       Photo Uploads                 Feed Requests
             |                           |
             |                           v
             |                      +---------+
             |                      |   CDN   |
             |                      +---------+
             |                           |
             |                    Cache miss / API
             |                           |
             v                           v
       +----------------+         +----------------+
       | Load Balancer  |<--------| Feed API       |
       +----------------+         +----------------+
                |                         |
                v                         v
       +----------------+         +----------------+
       |  App Servers   |-------->| Cache          |
       +----------------+         +----------------+
          |       |                         |
          |       |                         v
          |       |                  +-------------+
          |       +----------------->| Read Replica|
          |                          +-------------+
          |                                 ^
          |                                 |
          |                          Replication
          |                                 |
          |                          +-------------+
          +------------------------->| Primary DB  |
                                     +-------------+
          |
          +--------> +------------------+
                     | Object Storage   |
                     | Original Photos  |
                     | and Thumbnails  |
                     +------------------+
                              ^
                              |
                     +------------------+
                     | Thumbnail Worker |
                     +------------------+
                              ^
                              |
                     +------------------+
                     | Message Queue    |
                     +------------------+
                              ^
                              |
                     Upload event from
                        the app server
```

## 6. What Each Component Does

- **CDN:** Delivers frequently requested photos and thumbnails from locations closer to users, reducing latency and origin-server traffic.
- **Load balancer:** Distributes incoming API requests across healthy application servers to prevent one server from becoming overloaded.
- **App servers:** Handle application logic, authentication, upload authorization, feed generation, and requests from clients.
- **Cache:** Stores frequently accessed feed data and metadata in fast memory to reduce repeated database queries.
- **Primary database:** Stores authoritative structured data such as users, follows, photo metadata, and upload records.
- **Read replica:** Handles suitable read queries so the primary database has more capacity for writes and critical operations.
- **Object storage:** Stores original photos and thumbnails separately from the relational database, allowing photo storage to scale independently.
- **Message queue:** Holds thumbnail-generation jobs so uploading a photo does not have to wait for image processing to finish.
- **Thumbnail worker:** Reads queued jobs, generates smaller thumbnail images, and saves them to object storage.

## 7. Photo Upload Flow

1. A user selects a photo and starts an upload in the SnapShare application.
2. The app server authenticates the user, checks upload permissions, and validates the file type and size.
3. The original photo is uploaded to object storage, potentially using a short-lived signed upload URL so large files do not have to pass through the app server.
4. The application records the photo metadata and object-storage key in the primary database.
5. The application publishes a thumbnail-generation job to the message queue.
6. The app confirms that the upload has been accepted and can show the photo as processing until its thumbnail is ready.
7. A thumbnail worker consumes the queued job and downloads or reads the original photo from object storage.
8. The worker resizes the image, creates a thumbnail, and stores the thumbnail in object storage.
9. The worker updates the photo's processing status in the database, if the system tracks that status.
10. When users view the photo in a feed, the CDN serves the thumbnail or original file where possible, while the app servers and cache help retrieve the feed metadata.

The queue allows thumbnail processing to happen asynchronously. If the worker is temporarily unavailable, the job can remain queued and be retried rather than making the upload request fail immediately.

## 8. Trade-Offs

### Trade-Off 1: Cache Speed vs. Data Freshness

Caching feed data improves response times and reduces database load, but cached information can become stale when a user uploads a photo, changes a caption, or unfollows someone. SnapShare needs cache expiration or invalidation rules, which add complexity but help balance speed and freshness.

### Trade-Off 2: Asynchronous Processing vs. Immediate Availability

Using a queue for thumbnail generation makes uploads faster and allows thumbnail workers to scale independently. However, a thumbnail may not be available immediately after an upload. The application must handle processing states, retries, and failed jobs.

### Trade-Off 3: Read Replicas vs. Strong Consistency

A read replica can handle many feed and metadata queries without putting all read traffic on the primary database. However, replication can lag, meaning a newly uploaded photo might not appear immediately in a query served by the replica. Critical reads can use the primary database when fresh data is required.

### Trade-Off 4: Object Storage and CDN vs. Operational Complexity

Object storage and a CDN are scalable and cost-effective for serving large photos, but they introduce additional services, permissions, caching rules, and monitoring requirements. The system must manage secure access and ensure that updated or deleted photos are handled correctly.

## 9. Conclusion

SnapShare has approximately 1 million daily active users, an average of 12 uploads per second, an average of 579 feed views per second, and an estimated 748.25 TB of new photo and thumbnail storage per year.

Because feed views greatly outnumber uploads, the system is read-heavy. A CDN, cache, read replica, object storage, and asynchronous thumbnail-processing queue help it scale while keeping feed loading responsive and uploads reliable.