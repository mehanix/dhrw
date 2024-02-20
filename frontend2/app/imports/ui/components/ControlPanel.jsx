import {Button, ButtonGroup, Card, Icon, IconButton, Tag, TagLabel, TagLeftIcon, Text} from "@chakra-ui/react";
import {Panel} from "reactflow";
import React from 'react';
import { IoMdSave } from "react-icons/io";
import {AddIcon} from "@chakra-ui/icons";
import { IoPlay } from "react-icons/io5";
export default function ControlPanel({onSave}) {

    const save = () => {
        alert("Saving")
        onSave()
        alert("saved")
    }
    return <Panel position="top-center"><Card>
        <ButtonGroup isAttached variant='outline' spacing='2'>
            <IconButton aria-label="Save" onClick={save} icon={<Icon as={IoMdSave}></Icon>}> Save</IconButton>
            <IconButton aria-label="Deploy" icon={<Icon as={IoPlay}></Icon>}> Deploy</IconButton>
            <Tag size={"xs"} key={"status"} m={"1"} p={"2"} variant='subtle' colorScheme='cyan'>
                <TagLeftIcon boxSize='12px' as={AddIcon} />
                <TagLabel>Status: not running</TagLabel>
            </Tag>
            <Tag size={"xs"} key={"status"} m={"1"} p={"2"} variant='subtle' colorScheme='cyan'>
                <TagLeftIcon boxSize='12px' as={AddIcon} />
                <TagLabel>Status: not running</TagLabel>
            </Tag>
        </ButtonGroup>
    </Card></Panel>

}

