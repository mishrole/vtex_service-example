interface Args {
  country: string
}

interface University {
  name: string
  country: string
  domains: [string]
  state_province: string | undefined
  web_pages: [string]
  alpha_two_code: string
  'state-province'?: string
}

export const getUniversitiesQuery = async (
  _: unknown,
  { country }: Args,
  // ctx: Context
  { clients }: Context
) => {
  const {
    data: universities,
  } = await clients.universities.getUniversitiesByCountry(country)

  return universities.map((university: University) => {
    university.state_province = university['state-province']
    delete university['state-province']

    return university
  })
}
