"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFloorPlan = generateFloorPlan;
/**
 * Generates a floor plan based on parsed event data
 * @param parsedData Structured event data
 * @returns Generated floor plan layout
 */
function generateFloorPlan(parsedData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Extract venue dimensions
        const { width, length } = parsedData.venueSize;
        // Calculate number of tables needed based on guests and seating style
        let tableCapacity = 8; // Default capacity for round tables
        let tableShape = 'round';
        // Adjust table capacity and shape based on seating style
        if (parsedData.seatingStyle.toLowerCase().includes('theater')) {
            tableCapacity = 1; // Theater style doesn't use tables in the same way
            tableShape = 'rectangular';
        }
        else if (parsedData.seatingStyle.toLowerCase().includes('classroom')) {
            tableCapacity = 2; // Classroom style typically has 2 people per table
            tableShape = 'rectangular';
        }
        else if (parsedData.seatingStyle.toLowerCase().includes('banquet')) {
            tableCapacity = 8; // Banquet style typically has 8-10 people per round table
            tableShape = 'round';
        }
        // Calculate number of tables needed
        const numberOfTables = Math.ceil(parsedData.numberOfGuests / tableCapacity);
        // Generate tables
        const tables = [];
        const tableRadius = 0.75; // 1.5m diameter for round tables
        const tableWidth = 1.8; // 1.8m width for rectangular tables
        const tableHeight = 0.6; // 0.6m depth for rectangular tables
        // Calculate grid layout
        const gridColumns = Math.floor(Math.sqrt(numberOfTables));
        const gridRows = Math.ceil(numberOfTables / gridColumns);
        // Calculate spacing between tables
        const spacingX = width / (gridColumns + 1);
        const spacingY = length / (gridRows + 1);
        // Place tables in a grid pattern
        let tableId = 1;
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridColumns; col++) {
                if (tableId > numberOfTables)
                    break;
                if (tableShape === 'round') {
                    tables.push({
                        id: tableId,
                        type: 'table',
                        shape: 'round',
                        x: spacingX * (col + 1),
                        y: spacingY * (row + 1),
                        radius: tableRadius,
                        capacity: tableCapacity,
                        rotation: 0
                    });
                }
                else {
                    tables.push({
                        id: tableId,
                        type: 'table',
                        shape: 'rectangular',
                        x: spacingX * (col + 1),
                        y: spacingY * (row + 1),
                        width: tableWidth,
                        height: tableHeight,
                        capacity: tableCapacity,
                        rotation: 0
                    });
                }
                tableId++;
            }
        }
        // Add a stage
        const stage = {
            id: numberOfTables + 1,
            type: 'stage',
            x: width / 2,
            y: length - 1.5,
            width: Math.min(width / 3, 3),
            height: 1.5,
            rotation: 0
        };
        // Add exits
        const exits = [
            {
                id: numberOfTables + 2,
                type: 'exit',
                x: 0.5,
                y: 0.5,
                isEmergency: false
            },
            {
                id: numberOfTables + 3,
                type: 'exit',
                x: width - 0.5,
                y: 0.5,
                isEmergency: true
            }
        ];
        // Combine all elements
        const elements = [
            ...tables,
            stage,
            ...exits
        ];
        return {
            venueDimensions: {
                width,
                length
            },
            elements
        };
    });
}
