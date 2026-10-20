create database jettrack;
use jettrack;

CREATE TABLE `user` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `email` varchar(256) NOT NULL,
  `password_hash` varchar(128) NOT NULL,
  `role` varchar(45) DEFAULT NULL,
  `accountActiv` tinyint NOT NULL DEFAULT '1',
  `roleApprovedBy` int DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `cadet` (
  `cadetID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `rank` varchar(45) NOT NULL,
  `flight` varchar(45) NOT NULL,
  `grade_level` int NOT NULL,
  `position` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`cadetID`),
  KEY `fk_userID_idx` (`userID`),
  CONSTRAINT `fk_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `event` (
  `eventID` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(50) NOT NULL,
  `event_date` date NOT NULL,
  `location` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  PRIMARY KEY (`eventID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `servicehours` (
  `servicehoursID` int NOT NULL AUTO_INCREMENT,
  `cadetID` int NOT NULL,
  `eventID` int NOT NULL,
  `hours` decimal(10,0) NOT NULL,
  `service_date` date NOT NULL,
  PRIMARY KEY (`servicehoursID`),
  KEY `fk_cadetID4_idx` (`cadetID`),
  KEY `fk_eventid_idx` (`eventID`),
  CONSTRAINT `fk_cadetID4` FOREIGN KEY (`cadetID`) REFERENCES `cadet` (`cadetID`),
  CONSTRAINT `fk_eventid` FOREIGN KEY (`eventID`) REFERENCES `event` (`eventID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `award` (
  `awardID` int NOT NULL,
  `cadetID` int NOT NULL,
  `award_name` varchar(45) NOT NULL,
  `date_awarded` date NOT NULL,
  `award_description` varchar(500) NOT NULL,
  PRIMARY KEY (`awardID`),
  KEY `fk_cadetID3_idx` (`cadetID`),
  CONSTRAINT `fk_cadetID3` FOREIGN KEY (`cadetID`) REFERENCES `cadet` (`cadetID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `fitnessscore` (
  `FitnessScoreID` int NOT NULL AUTO_INCREMENT,
  `cadetID` int NOT NULL,
  `assessment_date` date DEFAULT NULL,
  `push_ups` int DEFAULT NULL,
  `sit_ups` int DEFAULT NULL,
  `mile_run` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`FitnessScoreID`),
  KEY `fk_cadet_idx` (`cadetID`),
  CONSTRAINT `fk_cadet` FOREIGN KEY (`cadetID`) REFERENCES `cadet` (`cadetID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `promotion` (
  `promotionID` int NOT NULL AUTO_INCREMENT,
  `cadetID` int NOT NULL,
  `new_rank` varchar(45) NOT NULL,
  `promotion_date` date NOT NULL,
  PRIMARY KEY (`promotionID`),
  KEY `fk_cadetID2_idx` (`cadetID`),
  CONSTRAINT `fk_cadetID2` FOREIGN KEY (`cadetID`) REFERENCES `cadet` (`cadetID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
