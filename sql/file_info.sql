/*
Navicat MySQL Data Transfer

Source Server         : 118.24.5.251
Source Server Version : 50718
Source Host           : 118.24.5.251:13306
Source Database       : file_info

Target Server Type    : MYSQL
Target Server Version : 50718
File Encoding         : 65001

Date: 2020-05-14 00:45:08
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for file_info
-- ----------------------------
DROP TABLE IF EXISTS `file_info`;
CREATE TABLE `file_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '唯一自增ID',
  `original_name` varchar(255) DEFAULT NULL COMMENT '文件名字',
  `full_name` varchar(255) DEFAULT NULL COMMENT '文件保存在服务器上的全路径名称',
  `file_status` tinyint(4) DEFAULT '0' COMMENT '文件状态：0正常；1锁定',
  `version` int(11) DEFAULT '0' COMMENT '文档版本',
  `user_ip` varchar(255) DEFAULT NULL COMMENT '当前锁定的用户ip',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '文件创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '文件最后更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
