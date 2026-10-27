USE jettrack;

ALTER TABLE `user`
ADD COLUMN `accountStatus`
VARCHAR(20) NOT NULL DEFAULT 'pending';
