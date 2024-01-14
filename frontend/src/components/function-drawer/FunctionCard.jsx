export default function FunctionCard(props) {

return <Card maxW='md'>
  <CardHeader>
    <Heading>Function</Heading>
  </CardHeader>
  <CardBody>
    <Text>
      {props.description}
    </Text>
  </CardBody>
  <Image
    objectFit='cover'
    src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
    alt='Chakra UI'
  />

  <CardFooter
    justify='space-between'
    flexWrap='wrap'
    sx={{
      '& > button': {
        minW: '136px',
      },
    }}
  >
    <Button flex='1' variant='ghost' leftIcon={<BiLike />}>
      Like
    </Button>
    <Button flex='1' variant='ghost' leftIcon={<BiChat />}>
      Comment
    </Button>
    <Button flex='1' variant='ghost' leftIcon={<BiShare />}>
      Share
    </Button>
  </CardFooter>
</Card>

}