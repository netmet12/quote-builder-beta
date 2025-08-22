-- Generated SQL to update type image URLs in Supabase
-- Run this in your Supabase SQL editor

-- Update type 10: /images/01-Metal-Doors.jpg
UPDATE product_types 
SET image_url = 'https://res.cloudinary.com/natemoshhh/image/upload/v1755810085/quote-builder-types/type-10-01-Metal-Doors.jpg'
WHERE id = 10;
-- Update type 20: /images/02-Wood-Doors.jpg
UPDATE product_types 
SET image_url = 'https://res.cloudinary.com/natemoshhh/image/upload/v1755810086/quote-builder-types/type-20-02-Wood-Doors.jpg'
WHERE id = 20;
-- Update type 30: /images/03-Metal-Building-Doors.jpg
UPDATE product_types 
SET image_url = 'https://res.cloudinary.com/natemoshhh/image/upload/v1755810086/quote-builder-types/type-30-03-Metal-Building-Doors.jpg'
WHERE id = 30;
-- Update type 40: /images/05-Frames-Only.jpg
UPDATE product_types 
SET image_url = 'https://res.cloudinary.com/natemoshhh/image/upload/v1755810087/quote-builder-types/type-40-05-Frames-Only.jpg'
WHERE id = 40;
-- Update type 70: http://prod-trudoor-media.s3.us-west-2.amazonaws.com/wp-content/uploads/2019/01/21112416/lite-kit-installed-in-hollow-metal-door-e1593305427638.jpg
UPDATE product_types 
SET image_url = 'https://res.cloudinary.com/natemoshhh/image/upload/v1755810088/quote-builder-types/type-70-lite-kit-installed-in-hollow-metal-door-e1593305427638.jpg'
WHERE id = 70;
-- Update type 80: https://prod-trudoor-media.s3.us-west-2.amazonaws.com/wp-content/uploads/2019/07/21110217/commercial-door-hardware.jpg
UPDATE product_types 
SET image_url = 'https://res.cloudinary.com/natemoshhh/image/upload/v1755810089/quote-builder-types/type-80-commercial-door-hardware.jpg'
WHERE id = 80;
-- Update type 90: https://prod-trudoor-media.s3.us-west-2.amazonaws.com/wp-content/uploads/2019/04/21112315/louvers.jpg
UPDATE product_types 
SET image_url = 'https://res.cloudinary.com/natemoshhh/image/upload/v1755810090/quote-builder-types/type-90-louvers.jpg'
WHERE id = 90;

-- Migration completed: 7 type images processed