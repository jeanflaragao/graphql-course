-- Insert users
INSERT INTO users (name, email, role) VALUES
('Alice Johnson', 'alice@example.com', 'ADMIN'),
('Bob Smith', 'bob@example.com', 'AUTHOR'),
('Carol Williams', 'carol@example.com', 'READER');

-- Insert posts
INSERT INTO posts (title, content, category, status, views, author_id) VALUES
('Getting Started with GraphQL', 'GraphQL is a query language for APIs...', 'TECHNOLOGY', 'PUBLISHED', 1250, 1),
('Healthy Living Tips', 'Here are some tips for healthy living...', 'LIFESTYLE', 'PUBLISHED', 890, 1),
('Business Strategies', 'Modern business requires...', 'BUSINESS', 'PUBLISHED', 2100, 2),
('My Draft Post', 'Work in progress...', 'TECHNOLOGY', 'DRAFT', 0, 2);

-- Insert comments
INSERT INTO comments (content, post_id, author_id) VALUES
('Great post!', 1, 2),
('Very helpful, thanks!', 1, 3),
('I disagree with this...', 3, 1),
('Can you elaborate?', 2, 3);
