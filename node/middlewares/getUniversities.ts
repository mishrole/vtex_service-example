export async function getUniversities(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: {
      route: { params },
    },
  } = ctx

  console.info('Received params:', params)

  const { country } = params

  console.info('Received country:', country)

  const APP_ID = process.env.VTEX_APP_ID ? process.env.VTEX_APP_ID : ''
  const {
    universities: universitiesSchema,
    country: countrySchema,
  } = await ctx.clients.apps.getAppSettings(APP_ID)

  console.info('Received universitiesSchema:', universitiesSchema)
  console.info('Received countrySchema:', countrySchema)

  const universitiesResponse = await ctx.clients.universities.getUniversitiesByCountry(
    country
  )

  console.info('Received universitiesResponse:', universitiesResponse)

  if (universitiesResponse.status === 200) {
    ctx.body = universitiesResponse.data
  } else {
    ctx.body = 'No universities found'
  }

  await next()
}
