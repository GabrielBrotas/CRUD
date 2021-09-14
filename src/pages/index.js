import {useEffect, useState} from 'react'
import {Button} from '@chakra-ui/react'
import { 
  Flex, 
  Text,
  Box,
  VStack, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast
} from "@chakra-ui/react"
import {InputForm} from '../components/Input'
import api from '../services/api'

export default function Home({ clients: fetchedClients }) {
  const toast = useToast()

  const [clients, setClients] = useState(fetchedClients)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [id, setId] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [errors, setErrors] = useState({name: null, email: null})

  const isValidFormData = () => {
    if(!name) {
      setErrors({name: 'Name is required'})
      return false
    }

    if(!email) {
      setErrors({email: 'Email is required'})
      return false
    }

    if(clients.some(client => client.email === email && client._id !== id)) {
      setErrors({email: "Email already in use"})
      return
    }

    setErrors({})
    return true
  }

  const handleSubmitCreateClient = async (e) => {
    e.preventDefault()

    if(!isValidFormData()) return

    try {
      setIsLoading(true)
      const {data} = await api.post('/clients', {name, email})

      setClients(clients.concat(data.data))
  
      setName('')
      setEmail('')
      toggleFormState()
      setIsLoading(false)

      toast({
        title: "Cliente cadastrado.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }catch(err) {
      console.log(err)
      setIsLoading(false)

    }

  }

  const handleSubmitUpdateClient = async (e) => {
    e.preventDefault()

    if(!isValidFormData()) return

    try {
      setIsLoading(true)

      await api.put(`/clients/${id}`, {name, email})
      setClients(clients.map(client => client._id === id ? {name, email, _id: id} : client))
  
      setName('')
      setEmail('')
      setId(null)
      toggleFormState()
      setIsLoading(false)

    }catch(err) {
      console.log(err)
      setIsLoading(false)

    }
  }

  const handleDeleteClient = async (_id) => {
    try {
      await api.delete(`/clients/${_id}`)
      setClients(clients.filter(client => client._id !== _id))
    }catch(err) {
      console.log(err)
    }
  }

  const handleChangeName = (text) => {
    setName(text)
  }

  const handleChangeEmail = (text) => {
    setEmail(text)
  }

  const handleShowUpdateClientForm = (client) => {
    setId(client._id)
    setName(client.name)
    setEmail(client.email)
    setIsFormOpen(true)
  }

  const toggleFormState = () => {
    setIsFormOpen(!isFormOpen)
  }

  // useEffect(() => {
  //   api.get('/clients').then(({data}) => {
  //     setClients(data.data)
  //   })
  // }, [])

  return (
    <Box margin="4">

    <Flex color="white" justifyContent="space-between">
      <Text color="black" fontSize="2xl">Lista de Clients</Text>
      
      <Button colorScheme="blue" onClick={toggleFormState}>{isFormOpen ? '-' : '+'}</Button>
    </Flex>

    { isFormOpen && (
      <VStack marginY="1rem" as="form" onSubmit={id ? handleSubmitUpdateClient : handleSubmitCreateClient}>
        <InputForm
          label="Nome"
          name="name"
          value={name} 
          onChange={e => handleChangeName(e.target.value)} 
          error={errors.name} 
        />

        <InputForm 
          label="Email" 
          name="email" 
          type="email" 
          value={email} 
          onChange={e => handleChangeEmail(e.target.value)}
          error={errors.email}
        />

        <Button fontSize="sm" alignSelf="flex-end" colorScheme="blue" type="submit" isLoading={isLoading}>{id? 'Atualizar' : 'Cadastrar'}</Button>
      </VStack>
    )}

    <Table variant="simple" my="10">
      <Thead bgColor="blue.500">
        <Tr>
          <Th textColor="white">Name</Th>
          <Th textColor="white">Email</Th>
          <Th textColor="white">Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {clients.map(client => (
          <Tr key={client.email}>
            <Td>{client.name}</Td>
            <Td>{client.email}</Td>
            <Td>
              <Flex justifyContent="space-between">
                <Button size="sm" fontSize="smaller" colorScheme="yellow" mr="2" onClick={() => handleShowUpdateClientForm(client)}>Editar</Button>
                <Button size="sm" fontSize="smaller" colorScheme="red" onClick={() => handleDeleteClient(client._id)}>Remover</Button>
              </Flex>
            </Td>
          </Tr>
        ))}
      </Tbody>

    </Table>
    </Box>
  )
}


export const getServerSideProps = async () => {
  try {
    const { data } = await api.get('/clients')

    return {
      props: {
        clients: data.data
      }
    }
  } catch (err) {
    console.log(err)
    return {
      props: {}
    }
  }
}