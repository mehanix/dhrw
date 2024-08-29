import {Card, CardHeader, Divider, FormControl, FormLabel, Input, Text} from "@chakra-ui/react";
import {Handle, Position} from "reactflow";
import React, { useMemo } from 'react'

const handleStyleTarget = {
    position: "relative",
    top: "-100px",
    left:"-10px"
}

const handleStyleSource = {
    position: "relative",
    top: "-100px",
    left:"97%"
}

export default function DatatypeBlock ({functionId, property, property_id, offset, type}) {

    return <Card variant="elevated">
        <CardHeader>
            <Text fontSize={'md'}>
                {property.title[0].toLowerCase() + property.title.slice(1)}
            </Text>
            <Text fontSize='md' textTransform={'uppercase'}>
                {property.type}
            </Text>
            <Divider/>
            <FormControl pt={"2"}>
                {/* <FormLabel>Value</FormLabel> */}
                <Input  disabled size={"sm"}></Input>
            </FormControl>
        </CardHeader>
        <Handle type={type} style={type === "source" ? handleStyleSource : handleStyleTarget} id={`${functionId}.${property_id}.${property.type}`}  position={type === "source" ? Position.Left : Position.Right}/>
    </Card>

    //
}