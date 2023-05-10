import { ZodError } from "zod"
import { UserBusiness } from "../../../src/business/UserBusiness"
import { GetUsersSchema } from "../../../src/dtos/user/getUsers.dto"
import { USER_ROLES } from "../../../src/models/User"
import { HashManagerMock } from "../../mocks/HashManagerMock"
import { IdGeneratorMock } from "../../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../../mocks/UserDatabaseMock"
import { BadRequestError } from "../../../src/errors/BadRequestError"

describe("Testando getUsers", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )

  test("deve retornar lista de todos users", async () => {
    const input = GetUsersSchema.parse({
      token: "token-mock-astrodev"
    })

    const output = await userBusiness.getUsers(input)

    expect(output).toHaveLength(2)
    expect(output).toEqual([
      {
        id: "id-mock-fulano",
        name: "Fulano",
        email: "fulano@email.com",
        createdAt: expect.any(String),
        role: USER_ROLES.NORMAL
      },
      {
        id: "id-mock-astrodev",
        name: "Astrodev",
        email: "astrodev@email.com",
        createdAt: expect.any(String),
        role: USER_ROLES.ADMIN
      },
    ])
  })
    test("Deve retornar 1 erro se não passar o token", () =>{
    //é para ler pelo menos 1 expect, caso nao caia no catch, ele retorna erro.
    expect.assertions(1)

    try {
      const input = GetUsersSchema.parse({
        q: "id-mock-fulano",
        token: undefined
      })
      
    } catch (error) {

      if(error instanceof ZodError){
        // console.log(error.issues)
        //Da para testar dessa forma item por item
        // expect(error.issues[0].message).toBe('Required')
        //Ou dessa forma
        expect(error.issues).toEqual([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: [ 'token' ],
            message: 'Required'
          }
        ]
    )
      }
    }


  })
  test("Deve retorna erro caso o id nao for de admin", async ()=>{
    expect.assertions(1)
    try {
      const input = GetUsersSchema.parse({
        token:"token-mock-fulano"
      })
      
      const output = await userBusiness.getUsers(input)
  
  
    } catch (error) {
      if(error instanceof BadRequestError){
        expect(error.message).toBe("somente admins podem acessar")
        expect(error.statusCode).toBe(400)
      }
    }
    expect(async ()=>{
      const input = GetUsersSchema.parse({
        idToDelete: "id-mock-astrodev",
        token:"token-mock-fulano"
      })
      const output = await userBusiness.getUsers(input)
    }).rejects.toThrowError(new BadRequestError("somente admins podem acessar"))
  })
})
