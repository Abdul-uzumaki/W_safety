# MASK – Voice Based Safety Assistant

## Overview

**MASK** is a smart wearable safety system designed to help women and vulnerable individuals during emergency situations.
The device monitors **motion, heart rate, and voice signals** to automatically detect distress and trigger alerts.

The system communicates with a **smartphone companion application** to send location data and emergency notifications to trusted contacts and authorities.

---

## Problem Statement

Many dangerous situations occur where victims cannot quickly access help or contact authorities.

Examples include:

* Women traveling alone
* Students commuting late at night
* Elderly people living independently
* Individuals in medical emergencies

In panic situations, victims may not be able to manually send alerts.
MASK solves this by **automatically detecting distress signals** and notifying emergency contacts.

---

## Key Features

* Voice-based distress detection
* Motion / fall detection
* Heart rate monitoring
* GPS location tracking
* Emergency alert system
* Vibration and buzzer alerts
* OLED display for status
* Smartphone companion integration
* Notification to trusted contacts and authorities

---

## System Architecture

![System Architecture](docs/system_architecture.jpg)

The system consists of three main layers:

### Device Layer

The wearable device collects sensor data.

Components used:

* Raspberry Pi 3 Model B (Main Controller)
* MAX30102 Heart Rate Sensor
* MPU6050 Motion Sensor
* INMP441 I2S Microphone
* NEO-6M GPS Module
* 0.96" OLED Display
* Vibration Motor
* Dual Buzzer
* SOS Push Button
* Li-Po Battery with TP4056 Charging Module

### Communication Layer

The device communicates with the smartphone using:

* WiFi
* Bluetooth Low Energy (BLE)

### Application / Cloud Layer

The smartphone companion application performs:

* Emergency alerts
* WhatsApp live location sharing
* Trusted contact notification
* Nearest police station alerts

---

## System Workflow

![Workflow](docs/workflow.jpg)

### User Input Layer

The system receives inputs from multiple sources:

* Voice commands
* SOS button press
* Motion detection
* Heart rate spikes

### Processing Layer

The main controller processes sensor data and runs a **Threat Detection Algorithm**.

The system switches between:

* **Normal Mode**
* **Alert Mode**

If a threat is detected:

* GPS location is retrieved
* Emergency alert is triggered

### Communication Layer

The device sends location data to the smartphone via:

* Bluetooth
* WiFi

### Output / Response Layer

The system activates:

* Buzzer alarm
* Vibration motor
* OLED alert message
* GPS location sharing
* Emergency notification to trusted contacts and authorities

---

## Hardware Components

| Component              | Purpose                   |
| ---------------------- | ------------------------- |
| Raspberry Pi 3 Model B | Main controller           |
| MAX30102               | Heart rate monitoring     |
| MPU6050                | Motion and fall detection |
| INMP441                | Voice detection           |
| NEO-6M                 | GPS location tracking     |
| OLED Display           | User interface            |
| Vibration Motor        | Haptic alerts             |
| Buzzer                 | Emergency alarm           |
| SOS Button             | Manual emergency trigger  |
| Li-Po Battery          | Portable power supply     |

---

## Hardware Progress

Current development status:

* Software platform completed
* Hardware assembly **40% completed**
* Remaining work includes:

  * Final hardware integration
  * Sensor calibration
  * Threat detection algorithm implementation
  * Alert system testing

---

## Future Improvements

* AI-based voice distress detection
* Mobile application integration
* Cloud database for incident reports
* Legal guidance and reporting system
* Emergency service integration

---

## Team

**Team Name:** BLACK CODEX
**Project:** MASK – Voice Based Safety Assistant
**Event:** KREATIVE GENESIS 2026
