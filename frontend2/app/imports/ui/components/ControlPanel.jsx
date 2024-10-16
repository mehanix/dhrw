import {Button, ButtonGroup, Card, Icon, IconButton, Tag, TagLabel, TagLeftIcon, Text} from "@chakra-ui/react";
import {Panel} from "reactflow";
import React from 'react';
import { IoMdSave } from "react-icons/io";
import {AddIcon} from "@chakra-ui/icons";
import { IoPlay, IoStop } from "react-icons/io5";
import { IoCloudOffline } from "react-icons/io5";
import { IoIosCloudDone } from "react-icons/io";
import { TiFlowMerge } from "react-icons/ti";

export default function ControlPanel({metadata}) {

    const save = () => {
        alert("Saving")
        onSave()
        alert("saved")
    }

    const changeGraphState = () => {
        if (metadata.status === "offline"){
            Meteor.call("graph.golive", metadata)
            console.log("going live......")
        } else {
            Meteor.call("graph.godown", metadata)
            console.log("going down......")
        }
    }
    return <Panel position="top-center"><Card>
        <ButtonGroup isAttached variant='outline' spacing='2'>
            <Tag m={"1"} p={"2"} align={"center"}>
                <TagLeftIcon boxSize='20px' as={TiFlowMerge} />
                <TagLabel>  <b>Now editing: </b> {metadata.name ?? "Loading..."}</TagLabel>
              </Tag>
            {/*<IconButton aria-label="Save"  icon={<Icon as={IoMdSave}></Icon>}> Save</IconButton>*/}
            <Tag size={"xs"} key={"status"} m={"1"} p={"2"} variant='subtle' colorScheme='cyan'>
                {metadata.status === "offline" ? <>
                    <TagLeftIcon boxSize='20px' as={IoCloudOffline} />
                </> : <>
                <TagLeftIcon boxSize='20px' as={IoIosCloudDone} />
            </>}
                <TagLabel>Flow is <b>{metadata.status}</b></TagLabel>

            </Tag>
            <IconButton aria-label="Deploy" onClick={changeGraphState} m={"1"} icon={<Icon as={(metadata.status === "offline" ? IoPlay: IoStop)}></Icon>}> Deploy</IconButton>

            {/*<Tag size={"xs"} key={"status"} m={"1"} p={"2"} variant='subtle' colorScheme='cyan'>*/}
            {/*    <TagLeftIcon boxSize='12px' as={AddIcon} />*/}
            {/*    <TagLabel>Status: not running</TagLabel>*/}
            {/*</Tag>*/}
        </ButtonGroup>
    </Card></Panel>

}

