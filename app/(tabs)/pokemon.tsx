import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface PokemonPics {
    back_default: string | null,
    back_female: string | null,
    back_shiny: string | null,
    back_shiny_female: string | null,
    front_default: string | null,
    front_female: string | null,
    front_shiny: string | null,
    front_shiny_female: string | null,
}
interface PokemonData {
    name: string,
    url: string,
    pic: PokemonPics
}

const renderedPokeCard = (item: PokemonData, i: number) => {
    const { name, pic, url } = item
    return (
        <View key={i} className="flex-1">
            <Image
                source={{ uri: pic?.front_default || 'No Image' }}
                style={{ width: 100, height: 100 }}>
            </Image>

            <Text>{name}</Text>
        </View>
    )
}

const pokemon = () => {
    useEffect(() => {
        fetchPokemon()
    }, [])

    const [pokemonData, setPokemonData] = useState<PokemonData[]>([])

    const fetchPokemon = async () => {
        try {
            const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=20")
            const data = await response.json()

            const getMorePokemonData = await Promise.all(
                data.results.map(async (newResponse: any) => {
                    const newDataFetch = await fetch(newResponse.url)
                    const pokemonResponse = await newDataFetch.json()
                    const pokePics = pokemonResponse.sprites
                    const pokeName = pokemonResponse.name

                    return {
                        name: pokeName,
                        pic: pokePics
                    }
                })
            )

            setPokemonData(getMorePokemonData)
        } catch (error) {
            console.log('Failed to fetch: ', error);
        }
    }
    return (
        <ScrollView>
            <SafeAreaView>
                {pokemonData.map((item, i) => {
                    return renderedPokeCard(item, i)
                })}
            </SafeAreaView>
        </ScrollView>
    );
}

export default pokemon